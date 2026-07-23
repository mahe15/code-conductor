use std::io::Read;
use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct PtyOutputPayload {
    pub session_id: String,
    pub data: String,
}

pub fn spawn_reader_loop<R: Read + Send + 'static>(
    session_id: String,
    mut reader: R,
    event_emitter: impl Fn(PtyOutputPayload) + Send + Sync + 'static,
) {
    std::thread::spawn(move || {
        let mut buffer = [0u8; 4096];
        loop {
            match reader.read(&mut buffer) {
                Ok(0) => break, // EOF
                Ok(n) => {
                    let data = String::from_utf8_lossy(&buffer[..n]).to_string();
                    event_emitter(PtyOutputPayload {
                        session_id: session_id.clone(),
                        data,
                    });
                }
                Err(_) => break,
            }
        }
    });
}
