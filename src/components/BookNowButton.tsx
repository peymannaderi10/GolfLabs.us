import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BookNowButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  iconPosition?: "left" | "right";
  text?: string;
}

export function BookNowButton({
  className = "",
  variant = "default",
  size = "default",
  iconPosition = "left",
  text = "Book Now"
}: BookNowButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    // If user is logged in, go directly to booking page
    // Otherwise, go to login page with redirect to booking
    if (user) {
      navigate('/booking');
    } else {
      navigate('/login', { state: { from: '/booking' } });
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleClick}
      className={className}
    >
      {iconPosition === "left" && <Calendar className="mr-2 h-5 w-5" />}
      {text}
      {iconPosition === "right" && <Calendar className="ml-2 h-5 w-5" />}
    </Button>
  );
} 