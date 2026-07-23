use serde::Serialize;

#[derive(Debug, Serialize, Clone)]
pub struct DecisionRequiredEvent {
    pub session_id: String,
    pub category: String,
    pub detected_assumption: String,
    pub suggested_options: Vec<String>,
    pub question_prompt: String,
}

pub struct StreamInterceptor {
    buffer: String,
}

impl StreamInterceptor {
    pub fn new() -> Self {
        StreamInterceptor {
            buffer: String::new(),
        }
    }

    pub fn inspect_chunk(&mut self, session_id: &str, chunk: &str) -> Option<DecisionRequiredEvent> {
        self.buffer.push_str(chunk);
        if self.buffer.len() > 2000 {
            let start = self.buffer.len() - 2000;
            self.buffer = self.buffer[start..].to_string();
        }

        // Example Regex Pattern Inspections
        if self.buffer.contains("Setting up Firebase Auth") || self.buffer.contains("I will use Firebase Auth") {
            return Some(DecisionRequiredEvent {
                session_id: session_id.to_string(),
                category: "Authentication".to_string(),
                detected_assumption: "Firebase Auth".to_string(),
                suggested_options: vec![
                    "Supabase Auth".to_string(),
                    "Firebase Auth".to_string(),
                    "Auth0".to_string(),
                    "Custom JWT".to_string(),
                ],
                question_prompt: "Which authentication solution should this project use?".to_string(),
            });
        }

        None
    }
}
