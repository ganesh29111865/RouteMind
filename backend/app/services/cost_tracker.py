"""
AI API Token & Financial Telemetry Cost Tracker
"""
class CostTracker:
    def __init__(self):
        self.call_count = 0
        self.prompt_tokens = 0
        self.completion_tokens = 0
        self.cost_per_call = 0.0015  # $0.0015 USD per explanation decision call

    def log_api_call(self, prompt_tokens: int = 360, completion_tokens: int = 80):
        self.call_count += 1
        self.prompt_tokens += prompt_tokens
        self.completion_tokens += completion_tokens

    def get_metrics(self):
        total_tokens = self.prompt_tokens + self.completion_tokens
        total_cost_usd = round(self.call_count * self.cost_per_call, 4)
        return {
            "total_api_calls": self.call_count,
            "total_prompt_tokens": self.prompt_tokens,
            "total_completion_tokens": self.completion_tokens,
            "total_tokens": total_tokens,
            "estimated_ai_cost_usd": total_cost_usd,
            "estimated_ai_cost_inr": round(total_cost_usd * 86.5, 2),
            "cost_per_explanation": self.cost_per_call
        }

cost_tracker = CostTracker()
