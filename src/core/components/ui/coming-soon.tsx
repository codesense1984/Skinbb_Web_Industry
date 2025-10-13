import { PageContent } from "./structure";

interface ComingSoonProps {
  title?: string;
}

export function ComingSoon({
  title = "Coming Soon",
}: ComingSoonProps) {
  return (
    <PageContent
      header={{
        title,
        hasBack: false,
        animate: true,
      }}
    >
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {/* Megaphone Icon - Using your PNG */}
        <div>
            <img 
              src="/coming_soon.png" 
              alt="Coming Soon" 
              className="w-96 h-96 object-contain"
            />
        </div>
      </div>
    </PageContent>
  );
}
