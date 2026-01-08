"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  uid: string;
  createdAt: any;
  roles: string[];
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "command_center_users"),
      (querySnapshot) => {
        try {
          const usersData: User[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              email: data.email,
              uid: data.uid,
              createdAt: data.createdAt,
              // Support both old 'type' and new 'roles' for migration
              roles: data.roles || (data.type ? [data.type] : []),
            };
          });
          // Sort users by created date (latest first)
          usersData.sort((a, b) => {
            const dateA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt).getTime() / 1000;
            const dateB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt).getTime() / 1000;
            return dateB - dateA; // Descending order (newest first)
          });
          setUsers(usersData);
          setLoading(false);
        } catch (err) {
          setError("Failed to fetch users");
          console.error("Error fetching users:", err);
          setLoading(false);
        }
      },
      (error) => {
        setError("Failed to listen for users");
        console.error("Error listening for users:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getDisplayName = (email: string) => {
    return email.split("@")[0] || email;
  };

  const getRoleDisplay = (roles: string[]) => {
    if (roles.length === 0) return "No Roles";
    const displays = roles.map(role => {
      switch (role) {
        case "COMMAND_CENTER": return "Admin";
        case "SAM_USER": return "SAM User";
        case "IT_USER": return "IT User";
        default: return "User";
      }
    });
    return displays.join(", ");
  };

  const updateUserRoles = async (userId: string, newRoles: string[]) => {
    try {
      const userDocRef = doc(db, "command_center_users", userId);
      await updateDoc(userDocRef, { roles: newRoles });
      // Update local state
      setUsers(users.map(user =>
        user.id === userId ? { ...user, roles: newRoles } : user
      ));
      toast({
        title: "Roles updated",
        description: "User roles have been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating user roles:", error);
      toast({
        title: "Error",
        description: "Failed to update user roles.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage users and their roles in the system.</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead className="w-[250px]">Email</TableHead>
                    <TableHead className="w-[150px]">Created Date</TableHead>
                    <TableHead className="w-[200px]">Roles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage users and their roles in the system.</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users and their roles in the system.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[250px]">Email</TableHead>
                  <TableHead className="w-[150px]">Created Date</TableHead>
                  <TableHead className="w-[200px]">Roles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{getDisplayName(user.email)}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.createdAt ? (user.createdAt.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : new Date(user.createdAt).toLocaleDateString()) : 'N/A'}</TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-[200px] justify-start">
                            {getRoleDisplay(user.roles)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`admin-${user.id}`}
                                checked={user.roles.includes('COMMAND_CENTER')}
                                onCheckedChange={(checked) => {
                                  const newRoles = checked
                                    ? [...user.roles, 'COMMAND_CENTER']
                                    : user.roles.filter(r => r !== 'COMMAND_CENTER');
                                  updateUserRoles(user.id, newRoles);
                                }}
                              />
                              <label htmlFor={`admin-${user.id}`} className="text-sm">Admin</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`sam-${user.id}`}
                                checked={user.roles.includes('SAM_USER')}
                                onCheckedChange={(checked) => {
                                  const newRoles = checked
                                    ? [...user.roles, 'SAM_USER']
                                    : user.roles.filter(r => r !== 'SAM_USER');
                                  updateUserRoles(user.id, newRoles);
                                }}
                              />
                              <label htmlFor={`sam-${user.id}`} className="text-sm">SAM User</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`it-${user.id}`}
                                checked={user.roles.includes('IT_USER')}
                                onCheckedChange={(checked) => {
                                  const newRoles = checked
                                    ? [...user.roles, 'IT_USER']
                                    : user.roles.filter(r => r !== 'IT_USER');
                                  updateUserRoles(user.id, newRoles);
                                }}
                              />
                              <label htmlFor={`it-${user.id}`} className="text-sm">IT User</label>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}