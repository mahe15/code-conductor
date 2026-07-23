pub struct PromptEnricher;

impl PromptEnricher {
    pub fn enrich(prompt: &str, locked_memories: &[(String, String)]) -> String {
        if locked_memories.is_empty() {
            return prompt.to_string();
        }

        let mut enriched = String::from("[SYSTEM CONTEXT ENFORCEMENT]\nActive Project Architecture Decisions:\n");
        for (key, val) in locked_memories {
            enriched.push_str(&format!("- {}: {}\n", key, val));
        }
        enriched.push_str("DO NOT ask or deviate from these established choices.\n\n[USER PROMPT]\n");
        enriched.push_str(prompt);

        enriched
    }
}
