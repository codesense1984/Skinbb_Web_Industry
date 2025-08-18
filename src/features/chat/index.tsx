import ChatComposer from "@/features/chat/ChatComposer";
import { PageContent } from "@/components/ui/structure";

const Chat = () => {
  return (
    <PageContent hideGradient showBorder>
      <ChatComposer />
    </PageContent>
  );
};

export default Chat;
