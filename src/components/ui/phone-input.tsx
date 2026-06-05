"use client";

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useState, useEffect } from "react";

type PhoneNumberInputProps = {
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
};

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value = "",
  onChange,
  placeholder = "123 456 789",
  error = false,
  disabled = false,
}) => {
  const [phone, setPhone] = useState<string>(value);

  useEffect(() => {
    setPhone(value);
  }, [value]);

  const handleChange = (newValue: string | undefined) => {
    const phoneValue = newValue || "";
    setPhone(phoneValue);
    onChange?.(newValue);
  };

  return (
    <div className={`relative flex items-center w-full h-10 rounded-md border bg-background px-3 transition-colors ${
      error ? "border-red-500" : "border-input"
    } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}>
      <PhoneInput
        international
        withCountryCallingCode
        defaultCountry="RW"
        countries={["RW", "CD"]}
        countryCallingCodeEditable={false}
        value={phone}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        numberInputProps={{
          className: "phone-input-formatted"
        }}
      />
    </div>
  );
};

export default PhoneNumberInput;
