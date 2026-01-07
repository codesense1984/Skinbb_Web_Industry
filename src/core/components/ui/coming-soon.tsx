import { PageContent } from "./structure";

interface ComingSoonProps {
  title?: string;
}

export function ComingSoon({ title = "Coming Soon" }: ComingSoonProps) {
  return (
    <PageContent
      header={{
        title,
        hasBack: false,
        animate: true,
      }}
    >
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        {/* Megaphone Icon - Using your PNG */}
        <div>
          <img
            src="/coming_soon.png"
            alt="Coming Soon"
            className="h-96 w-96 object-contain"
          />
        </div>
      </div>
    </PageContent>
  );
}
