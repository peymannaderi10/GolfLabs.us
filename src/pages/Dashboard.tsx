import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

// Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookNowButton } from "@/components/BookNowButton";

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
  bayName: string;
  bayNumber: number;
}

const API_BASE_URL = "http://localhost:4242";

const BookingCard = ({ booking }: { booking: Booking }) => (
  <Card className="mb-4">
    <CardHeader>
      <CardTitle className="text-lg">{booking.bayName}</CardTitle>
      <CardDescription>{format(new Date(booking.startTime), "eeee, MMMM do, yyyy")}</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-2">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Time:</span>
        <span>{format(new Date(booking.startTime), "p")} - {format(new Date(booking.endTime), "p")}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Status:</span>
        <span className="capitalize font-semibold">{booking.status}</span>
      </div>
       <div className="flex justify-between">
        <span className="text-muted-foreground">Total:</span>
        <span>${booking.totalAmount}</span>
      </div>
    </CardContent>
  </Card>
);

const BookingsList = ({ type }: { type: 'upcoming' | 'past' }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      // Convert 'upcoming' to 'future' for the API endpoint
      const endpoint = type === 'upcoming' ? 'future' : 'past';
      fetch(`${API_BASE_URL}/users/${user.id}/bookings/${endpoint}`)
        .then(res => res.json())
        .then((data) => {
          if (!data.error) {
            setBookings(data);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [user, type]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">You have no {type} bookings.</p>
        {type === 'upcoming' && (
          <BookNowButton />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
};

const DashboardProfile = () => {
  const { user, profile } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p>{profile?.full_name || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p>{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p>{profile?.phone || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user, profile, signOut, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");
  const navigate = useNavigate();

  console.log('Dashboard render:', { user: !!user, profile, isLoading });

  // Show loading state while auth is loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // User initials for avatar
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.charAt(0).toUpperCase() || 'U';

  const tabs = [
    {
      id: "bookings",
      label: "Bookings",
      icon: Calendar,
    },
    {
      id: "past-bookings",
      label: "Past Bookings",
      icon: Clock,
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="flex flex-col items-center justify-center p-6 border-b border-border">
          <Avatar className="h-16 w-16 mb-4">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold">{profile?.full_name || 'User'}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex flex-col p-4 space-y-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={cn(
                "justify-start",
                activeTab === tab.id && "bg-primary text-primary-foreground"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="mr-2 h-5 w-5" />
              {tab.label}
            </Button>
          ))}
          {/* Logout Button */}
          <Button
            variant="outline"
            className="justify-start mt-6 text-destructive border-destructive hover:bg-destructive hover:text-white"
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 md:p-8">
        {/* Mobile tabs */}
        <div className="md:hidden mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <Card className="border-border">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </CardTitle>
              {activeTab === "bookings" && (
                <BookNowButton 
                  variant="default"
                  size="lg"
                  iconPosition="left"
                  text="Book a Bay"
                  className="font-semibold"
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === "bookings" && <BookingsList type="upcoming" />}
            {activeTab === "past-bookings" && <BookingsList type="past" />}
            {activeTab === "profile" && <DashboardProfile />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 