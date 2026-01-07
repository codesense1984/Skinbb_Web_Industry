import { useState, useEffect } from "react";
import { cn } from "@/core/utils";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
  },
  {
    label: "At least 1 number",
    test: (password) => /\d/.test(password),
  },
  {
    label: "At least 1 lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: "At least 1 uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: "At least 1 special character",
    test: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  },
];

const getPasswordStrength = (
  password: string,
): { score: number; label: string; color: string } => {
  const validRequirements = requirements.filter((req) =>
    req.test(password),
  ).length;
  const percentage = (validRequirements / requirements.length) * 100;

  if (percentage < 40) {
    return { score: 1, label: "Weak", color: "bg-red-500" };
  } else if (percentage < 70) {
    return { score: 2, label: "Fair", color: "bg-yellow-500" };
  } else if (percentage < 90) {
    return { score: 3, label: "Good", color: "bg-blue-500" };
  } else {
    return { score: 4, label: "Strong", color: "bg-green-500" };
  }
};

export function PasswordStrength({
  password,
  className,
}: PasswordStrengthProps) {
  const [showRequirements, setShowRequirements] = useState(false);
  const strength = getPasswordStrength(password);
  const validRequirements = requirements.filter((req) => req.test(password));

  useEffect(() => {
    if (password.length > 0) {
      setShowRequirements(true);
    } else {
      setShowRequirements(false);
    }
  }, [password]);

  if (!showRequirements) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Password strength:</span>
          <span
            className={cn(
              "font-medium",
              strength.score === 1 && "text-red-600",
              strength.score === 2 && "text-yellow-600",
              strength.score === 3 && "text-blue-600",
              strength.score === 4 && "text-green-600",
            )}
          >
            {strength.label}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200">
          <div
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              strength.color,
              strength.score === 1 && "w-1/4",
              strength.score === 2 && "w-1/2",
              strength.score === 3 && "w-3/4",
              strength.score === 4 && "w-full",
            )}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-700">
          {strength.score < 4 ? "Must contain:" : "All requirements met!"}
        </p>
        <div className="grid grid-cols-1 gap-1">
          {requirements.map((requirement, index) => {
            const isValid = requirement.test(password);
            return (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <div
                  className={cn(
                    "flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full",
                    isValid ? "bg-green-100" : "bg-red-100",
                  )}
                >
                  {isValid ? (
                    <svg
                      className="h-2.5 w-2.5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-2.5 w-2.5 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs",
                    isValid ? "text-green-600" : "text-red-600",
                  )}
                >
                  {requirement.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
