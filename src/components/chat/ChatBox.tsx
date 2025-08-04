"use client";
import { Button } from "@/components/ui/button";
import { HorizontalLogo } from "@/config/svg";
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
// import { SVGBiglogo } from "@/config/svg";

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
    <div className="flex h-full flex-1 flex-col justify-center">
      {messages.length === 0 && (
        <div className="text-muted-foreground mx-auto flex max-w-lg grow flex-col justify-center gap-5 text-center">
          {<HorizontalLogo />}
          <h3 className="text-foreground">Welcome to Skinbb Metaverse!</h3>
          <p className="text-lg">
            Connect, chat, and explore the future of beauty and skincare in the
            SkinBB Metaverse - a vibrant digital space where innovation meets
            self-expression.
          </p>
        </div>
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
      <div className="sticky bottom-0 w-full pt-4 md:pt-8">
        <div className="bg-background mx-auto max-w-3xl pb-4">
          <div className="form-control h-full flex-col overflow-hidden rounded-2xl p-0 shadow">
            <textarea
              className="form-control h-full min-h-[45px] [resize:none] border-0 bg-transparent text-lg leading-relaxed focus-visible:border-0 focus-visible:ring-0"
              placeholder="Ask me anything about skin care..."
              aria-label="Enter your prompt"
              value={input}
              rows={1}
              onChange={(e) => dispatch(setInput(e.target.value))}
              onKeyDown={handleKeyDown}
              onInput={(e) => {
                const maxHeight = 84;
                e.currentTarget.style.height = "auto";
                const newHeight = Math.min(
                  e.currentTarget.scrollHeight,
                  maxHeight,
                );
                e.currentTarget.style.height = `${newHeight}px`;
              }}
              // disabled={loading}
              ref={textareaRef}
            />
            <div className="flex items-center justify-end gap-2 p-2 pt-0">
              <Button
                className="rounded-full disabled:opacity-0"
                onClick={handleSend}
                color={"primary"}
                variant={"contained"}
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
