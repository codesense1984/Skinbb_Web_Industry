import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Textarea } from "@/core/components/ui/textarea";
import { cn } from "@/core/utils";
import { MessageCircle, Send, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router";
import { FORMULATOR_ROUTES } from "../routes/constant";
import axios from "axios";
import { basePythonApiUrl } from "@/core/config/baseUrls";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  redirectButtons?: Array<{
    label: string;
    route: string;
    description?: string;
  }>;
}

interface ChatbotResponse {
  message: string;
  intent?: string;
  hasInspirations?: boolean;
  redirectButtons?: Array<{
    label: string;
    route: string;
    description?: string;
  }>;
  platformInfo?: string;
}

// Feature mapping based on user intent
const featureMap: Record<string, { route: string; description: string }> = {
  decode: {
    route: FORMULATOR_ROUTES.FORMULATIONS.DECODE,
    description: "Analyze and decode existing formulations",
  },
  "market research": {
    route: FORMULATOR_ROUTES.MARKET_RESEARCH.BASE,
    description: "Find products with matching ingredients",
  },
  compare: {
    route: FORMULATOR_ROUTES.COMPARE.BASE,
    description: "Compare ingredients from different products",
  },
  account: {
    route: FORMULATOR_ROUTES.ACCOUNT.BASE,
    description: "Manage your account settings",
  },
};

const FormulatorChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your formulation assistant. What would you like to do today? You can decode formulations, do market research, compare products, or manage your account.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationState, setConversationState] = useState<{
    intent?: string;
    askedInspirations?: boolean;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const api = {
    async chatWithBot(message: string, conversationHistory: Message[]): Promise<ChatbotResponse> {
      try {
        const response = await axios.post(
          `${basePythonApiUrl}/api/chatbot/chat`,
          {
            message,
            conversation_history: conversationHistory.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            conversation_state: conversationState,
          },
        );
        return response.data;
      } catch (error: any) {
        console.error("Chatbot API error:", error);
        throw new Error(error.response?.data?.detail || "Failed to get response from chatbot");
      }
    },
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.chatWithBot(userMessage.content, messages);

      // Update conversation state based on response
      if (response.intent) {
        setConversationState((prev) => ({
          ...prev,
          intent: response.intent,
          askedInspirations: response.hasInspirations === false ? true : prev.askedInspirations,
        }));
      }

      // Use redirect buttons from backend response
      const redirectButtons = response.redirectButtons || [];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message || response.platformInfo || "I'm here to help you with formulations!",
        timestamp: new Date(),
        redirectButtons: redirectButtons.length > 0 ? redirectButtons : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };


  const handleRedirect = (route: string) => {
    setOpen(false);
    navigate(route);
    // Reset conversation state
    setConversationState({});
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Hi! I'm your formulation assistant. What would you like to do today? You can decode formulations, do market research, compare products, or manage your account.",
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "h-14 w-14 rounded-full",
          "bg-primary text-primary-foreground",
          "shadow-lg hover:shadow-xl",
          "flex items-center justify-center",
          "transition-all duration-200",
          "hover:scale-110 active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        )}
        aria-label="Open chatbot"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex flex-col h-[600px] max-w-2xl p-0" showCloseButton={false}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Formulation Assistant
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Redirect Buttons */}
                  {message.redirectButtons && message.redirectButtons.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.redirectButtons.map((button, idx) => (
                        <Button
                          key={idx}
                          variant="outlined"
                          size="sm"
                          onClick={() => handleRedirect(button.route)}
                          className="w-full text-left justify-start"
                        >
                          {button.label}
                          {button.description && (
                            <span className="ml-2 text-xs opacity-70">
                              - {button.description}
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t px-6 py-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[60px] resize-none"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                size="icon"
                className="h-[60px] w-[60px] shrink-0"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FormulatorChatbot;

