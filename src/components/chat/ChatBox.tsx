"use client";
import { Button } from "@/components/ui/button";
import {
  addUserMessage,
  sendMessageAsync,
  setInput,
} from "@/context/slices/chatSlice";
import type { AppDispatch, RootState } from "@/context/store";
import { useAuth } from "@/hooks/useAuth";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChatMessage } from "./ChatMessage";

export default function ChatBox() {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, input, loading, hasStartedResponse } = useSelector(
    (state: RootState) => state.chat,
  );
  const auth = useAuth();
  //   console.log("🚀 ~ ChatBox ~ auth:", auth.user?.profilePic[0].url)

  const handleSend = () => {
    if (!input.trim()) return;
    dispatch(addUserMessage(input));
    dispatch(sendMessageAsync(input));
    dispatch(setInput(""));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    textareaRef.current?.focus();
  }, [messages]);

  return (
    <div className="flex h-full min-h-[77dvh] flex-col justify-center p-4">
      {messages.length === 0 && (
        <h3 className="text-muted-foreground text-center text-xl italic md:text-3xl">
          Ask me anything to get started!
        </h3>
      )}
      {!!messages.length && (
        <div className="relative grow">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* <div className=" my-8 text-center"></div> */}
            {messages.map((msg, idx) => (
              <ChatMessage
                key={idx}
                loading={loading && idx === messages.length - 1}
                isUser={msg.isUser}
                userProfile={auth.user?.profilePic[0].url}
              >
                {msg.content}
              </ChatMessage>
            ))}

            {loading && !hasStartedResponse && (
              <ChatMessage loading={true}>
                <p className="text-muted-foreground italic">Thinking...</p>
              </ChatMessage>
            )}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>
        </div>
      )}
      <div className="sticky bottom-0 pt-4 md:pt-8">
        <div className="bg-background mx-auto max-w-3xl rounded-[20px] pb-4">
          <div className="bg-muted focus-within:bg-muted/50 focus-within:border-input relative rounded-[20px] border transition-colors has-[:disabled]:cursor-not-allowed [&:has(input:is(:disabled))_*]:pointer-events-none">
            <textarea
              className="text-foreground placeholder:text-muted-foreground/70 flex w-full [resize:none] bg-transparent px-4 py-3 text-[15px] leading-relaxed focus-visible:outline-none sm:min-h-[84px]"
              placeholder="Ask me anything..."
              aria-label="Enter your prompt"
              value={input}
              onChange={(e) => dispatch(setInput(e.target.value))}
              onKeyDown={handleKeyDown}
              onInput={(e) => {
                e.currentTarget.style.height = "auto";
                e.currentTarget.style.height =
                  e.currentTarget.scrollHeight + "px";
              }}
              disabled={loading}
              ref={textareaRef}
            />
            <div className="flex items-center justify-end gap-2 p-3">
              <Button
                className="rounded-full disabled:opacity-50"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                loading={loading}
                size={"icon"}
                startIcon={<ArrowUpIcon />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
