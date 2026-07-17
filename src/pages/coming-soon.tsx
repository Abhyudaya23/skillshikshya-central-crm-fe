import { Construction } from "lucide-react";

export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex h-full min-h-[60dvh] flex-col items-center justify-center gap-3 text-center">
      <div className="bg-brand/10 text-brand flex size-14 items-center justify-center rounded-2xl">
        <Construction className="size-7" />
      </div>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        The {title} module is ready in the navigation, but its backend API hasn't shipped yet.
        It will be wired up as soon as the endpoints are available.
      </p>
    </div>
  );
}
