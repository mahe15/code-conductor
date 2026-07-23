use portable_pty::{native_pty_system, Child, CommandBuilder, MasterPty, PtySize};
use std::collections::HashMap;
use std::io::Write;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use parking_lot::Mutex;

pub struct PtySession {
    pub id: String,
    pub master: Box<dyn MasterPty + Send>,
    pub child: Box<dyn Child + Send + Sync>,
    pub writer: Box<dyn Write + Send>,
    pub is_paused: Arc<AtomicBool>,
}

pub struct PtyManager {
    sessions: Mutex<HashMap<String, PtySession>>,
}

impl PtyManager {
    pub fn new() -> Self {
        PtyManager {
            sessions: Mutex::new(HashMap::new()),
        }
    }

    pub fn spawn_session(
        &self,
        session_id: String,
        command: String,
        args: Vec<String>,
        cwd: String,
        cols: u16,
        rows: u16,
    ) -> Result<(), String> {
        let pty_system = native_pty_system();
        let pair = pty_system
            .openpty(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Failed to open PTY pair: {}", e))?;

        let mut cmd = CommandBuilder::new(command);
        cmd.args(args);
        cmd.cwd(cwd);

        let child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|e| format!("Failed to spawn command in PTY: {}", e))?;

        let writer = pair
            .master
            .take_writer()
            .map_err(|e| format!("Failed to take PTY writer: {}", e))?;

        let session = PtySession {
            id: session_id.clone(),
            master: pair.master,
            child,
            writer,
            is_paused: Arc::new(AtomicBool::new(false)),
        };

        let mut sessions = self.sessions.lock();
        sessions.insert(session_id, session);
        Ok(())
    }

    pub fn write_input(&self, session_id: &str, data: &[u8]) -> Result<(), String> {
        let mut sessions = self.sessions.lock();
        if let Some(session) = sessions.get_mut(session_id) {
            session
                .writer
                .write_all(data)
                .map_err(|e| format!("Failed to write to PTY stdin: {}", e))?;
            session
                .writer
                .flush()
                .map_err(|e| format!("Failed to flush PTY stdin: {}", e))?;
            Ok(())
        } else {
            Err(format!("Session {} not found", session_id))
        }
    }

    pub fn resize_pty(&self, session_id: &str, cols: u16, rows: u16) -> Result<(), String> {
        let sessions = self.sessions.lock();
        if let Some(session) = sessions.get(session_id) {
            session
                .master
                .resize(PtySize {
                    rows,
                    cols,
                    pixel_width: 0,
                    pixel_height: 0,
                })
                .map_err(|e| format!("Failed to resize PTY: {}", e))?;
            Ok(())
        } else {
            Err(format!("Session {} not found", session_id))
        }
    }

    pub fn pause_session(&self, session_id: &str) -> Result<(), String> {
        let sessions = self.sessions.lock();
        if let Some(session) = sessions.get(session_id) {
            session.is_paused.store(true, Ordering::SeqCst);
            // Signal process pause
            #[cfg(unix)]
            {
                if let Some(pid) = session.child.process_id() {
                    unsafe { libc::kill(pid as i32, libc::SIGSTOP); }
                }
            }
            Ok(())
        } else {
            Err(format!("Session {} not found", session_id))
        }
    }

    pub fn resume_session(&self, session_id: &str) -> Result<(), String> {
        let sessions = self.sessions.lock();
        if let Some(session) = sessions.get(session_id) {
            session.is_paused.store(false, Ordering::SeqCst);
            // Signal process resume
            #[cfg(unix)]
            {
                if let Some(pid) = session.child.process_id() {
                    unsafe { libc::kill(pid as i32, libc::SIGCONT); }
                }
            }
            Ok(())
        } else {
            Err(format!("Session {} not found", session_id))
        }
    }

    pub fn kill_session(&self, session_id: &str) -> Result<(), String> {
        let mut sessions = self.sessions.lock();
        if let Some(mut session) = sessions.remove(session_id) {
            let _ = session.child.kill();
            Ok(())
        } else {
            Err(format!("Session {} not found", session_id))
        }
    }
}
