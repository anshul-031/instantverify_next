"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "verification" | "system" | "payment";
  title: string;
  message: string;
  status: "unread" | "read";
  createdAt: string;
}

export default function NotificationsPage() {
  const { session } = useAuth({ required: true });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications");
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch notifications",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [toast]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, status: "read" }
            : notification
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "PUT",
      });

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, status: "read" }))
      );

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "verification":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "system":
        return <Bell className="h-4 w-4 text-blue-500" />;
      case "payment":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {notifications.some((n) => n.status === "unread") && (
            <Button variant="outline" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground">
                  No notifications to display
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={notification.status === "unread" ? "border-primary" : ""}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    {getIcon(notification.type)}
                    <CardTitle className="text-base">
                      {notification.title}
                    </CardTitle>
                  </div>
                  {notification.status === "unread" && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {notification.message}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}