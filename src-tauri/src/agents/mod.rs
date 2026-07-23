pub trait CliAgentAdapter: Send + Sync {
    fn name(&self) -> &'static str;
    fn binary_name(&self) -> &'static str;
    fn build_spawn_args(&self, initial_prompt: Option<&str>) -> Vec<String>;
}

pub struct ClaudeCodeAdapter;

impl CliAgentAdapter for ClaudeCodeAdapter {
    fn name(&self) -> &'static str {
        "Claude Code CLI"
    }

    fn binary_name(&self) -> &'static str {
        "claude"
    }

    fn build_spawn_args(&self, initial_prompt: Option<&str>) -> Vec<String> {
        let mut args = vec![];
        if let Some(prompt) = initial_prompt {
            args.push("--print".to_string());
            args.push(prompt.to_string());
        }
        args
    }
}

pub struct CodexAdapter;

impl CliAgentAdapter for CodexAdapter {
    fn name(&self) -> &'static str {
        "Codex CLI"
    }

    fn binary_name(&self) -> &'static str {
        "codex"
    }

    fn build_spawn_args(&self, initial_prompt: Option<&str>) -> Vec<String> {
        let mut args = vec![];
        if let Some(prompt) = initial_prompt {
            args.push(prompt.to_string());
        }
        args
    }
}

pub struct GenericShellAdapter;

impl CliAgentAdapter for GenericShellAdapter {
    fn name(&self) -> &'static str {
        "Generic System Shell"
    }

    fn binary_name(&self) -> &'static str {
        #[cfg(target_os = "windows")]
        { "powershell.exe" }

        #[cfg(not(target_os = "windows"))]
        { "bash" }
    }

    fn build_spawn_args(&self, _initial_prompt: Option<&str>) -> Vec<String> {
        vec![]
    }
}
