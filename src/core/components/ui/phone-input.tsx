import React, { useState, useCallback } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Check, ChevronDown, Phone } from "lucide-react";
import { cn } from "@/core/utils/classnames";

// Country data with common countries
const countries = [
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
];

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string, countryCode: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultCountry?: string;
}

export function PhoneInput({
  value = "",
  onChange,
  placeholder = "Enter phone number",
  disabled = false,
  className,
  defaultCountry = "IN", // Default to India
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find(c => c.code === defaultCountry) || countries[1] // Default to India
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [open, setOpen] = useState(false);

  // Parse initial value if provided
  React.useEffect(() => {
    if (value) {
      // Try to extract country code and phone number from the value
      const country = countries.find(c => value.startsWith(c.dialCode));
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(value.replace(country.dialCode, "").trim());
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value]);

  const handleCountrySelect = useCallback((country: typeof countries[0]) => {
    setSelectedCountry(country);
    setOpen(false);
    const fullNumber = country.dialCode + phoneNumber;
    onChange?.(fullNumber, country.dialCode);
  }, [phoneNumber, onChange]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = e.target.value;
    setPhoneNumber(newPhoneNumber);
    const fullNumber = selectedCountry.dialCode + newPhoneNumber;
    onChange?.(fullNumber, selectedCountry.dialCode);
  }, [selectedCountry.dialCode, onChange]);

  return (
    <div className={cn("flex", className)}>
      {/* Country Code Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-[140px] justify-between rounded-r-none border-r-0",
              disabled && "cursor-not-allowed opacity-50"
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.dialCode}`}
                    onSelect={() => handleCountrySelect(country)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-lg">{country.flag}</span>
                      <div className="flex-1">
                        <div className="font-medium">{country.name}</div>
                        <div className="text-sm text-muted-foreground">{country.dialCode}</div>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedCountry.code === country.code ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Phone Number Input */}
      <Input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        disabled={disabled}
        className="rounded-l-none border-l-0"
      />
    </div>
  );
}

// Hook for phone input with separate country code and phone number
export function usePhoneInput(initialValue?: string) {
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");

  React.useEffect(() => {
    if (initialValue) {
      const country = countries.find(c => initialValue.startsWith(c.dialCode));
      if (country) {
        setCountryCode(country.dialCode);
        setPhoneNumber(initialValue.replace(country.dialCode, "").trim());
      } else {
        setPhoneNumber(initialValue);
      }
    }
  }, [initialValue]);

  const handleChange = useCallback((fullNumber: string, newCountryCode: string) => {
    setCountryCode(newCountryCode);
    const number = fullNumber.replace(newCountryCode, "").trim();
    setPhoneNumber(number);
  }, []);

  return {
    countryCode,
    phoneNumber,
    fullNumber: countryCode + phoneNumber,
    handleChange,
  };
}
