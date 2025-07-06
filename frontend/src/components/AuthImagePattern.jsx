import { Sparkles } from "lucide-react";

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-neutral p-12">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Circle */}
        <div className="flex justify-center">
          <div className="bg-base-100/10 border border-base-100/20 p-4 rounded-full">
            <Sparkles size={40} className="text-primary" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-3xl font-bold text-base-100">{title}</h2>
        <p className="text-base-content/70 text-base">{subtitle}</p>

        {/* Glowing Blocks */}
        <div className="flex justify-center gap-3 pt-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`h-14 w-14 rounded-xl bg-primary/20 ${
                i % 2 === 0 ? "animate-pulse" : "animate-bounce"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthImagePattern;