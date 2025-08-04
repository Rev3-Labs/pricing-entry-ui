import React from "react";
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends Omit<MuiButtonProps, "variant"> {
  variant?: "primary" | "secondary";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  icon: Icon,
  iconPosition = "left",
  children,
  sx,
  ...props
}) => {
  const baseStyles = {
    borderRadius: "100px",
    textTransform: "none" as const,
    display: "flex",
    alignItems: "center",
    gap: 1,
    px: 2,
    py: 1,
    fontSize: "14px",
    fontWeight: 500,
  };

  const variantStyles = {
    primary: {
      backgroundColor: "#65b230",
      color: "white",
      "&:hover": {
        backgroundColor: "#4a8a1f",
      },
      "&:disabled": {
        backgroundColor: "#b9b9b9",
        color: "#666",
      },
    },
    secondary: {
      borderColor: "#b9b9b9",
      color: "#49454f",
      "&:hover": {
        borderColor: "#65b230",
        color: "#65b230",
        backgroundColor: "rgba(101, 178, 48, 0.04)",
      },
      "&:disabled": {
        borderColor: "#b9b9b9",
        color: "#b9b9b9",
      },
    },
  };

  const renderContent = () => {
    if (Icon) {
      if (iconPosition === "right") {
        return (
          <>
            <span>{children}</span>
            <Icon className="h-4 w-4" />
          </>
        );
      } else {
        return (
          <>
            <Icon className="h-4 w-4" />
            <span>{children}</span>
          </>
        );
      }
    }
    return <span>{children}</span>;
  };

  return (
    <MuiButton
      variant={variant === "primary" ? "contained" : "outlined"}
      sx={{
        ...baseStyles,
        ...variantStyles[variant],
        ...sx,
      }}
      {...props}
    >
      {renderContent()}
    </MuiButton>
  );
};

// Convenience components for common use cases
export const PrimaryButton: React.FC<Omit<ButtonProps, "variant">> = (
  props
) => <Button variant="primary" {...props} />;

export const SecondaryButton: React.FC<Omit<ButtonProps, "variant">> = (
  props
) => <Button variant="secondary" {...props} />;

// Export the base Button component as default
export default Button;
