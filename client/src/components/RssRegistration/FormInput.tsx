import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormInputProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  type: string;
  onChange: (value: string) => void;
}

export function FormInput({ id, label, value, placeholder, type, onChange }: FormInputProps) {
  return (
    <div className="flex items-center gap-4">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <div className="relative flex-grow">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full peer border-0 border-b border-input bg-transparent focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none placeholder:text-muted-foreground placeholder:text-sm"
          type={type}
        />
        <div className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-primary transition-transform duration-300 ease-in-out peer-focus:scale-x-100" />
      </div>
    </div>
  );
}
