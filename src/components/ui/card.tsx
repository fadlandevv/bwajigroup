import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-3xl border border-gray-100 bg-white shadow-sm", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("p-6 pb-0", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-bold text-[#1D1A40]", className)} {...props} />
  );
}

function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("p-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: CardProps) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
