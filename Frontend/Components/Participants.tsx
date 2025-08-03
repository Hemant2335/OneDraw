"use client";

import React, {useEffect, useState} from 'react';
import {Avatar, AvatarFallback, AvatarImage} from "@/Components/ui/avatar";
import {Badge} from "@/Components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/Components/ui/card";
import {User, Users} from "lucide-react";
import UserFetcher, {User as UserType} from "@/utils/userFetcher";


interface ParticipantsProps {
  participants: string[];
  currentUserId: string;
  isCollabMode: boolean;
}

const Participants: React.FC<ParticipantsProps> = ({ 
  participants, 
  currentUserId, 
  isCollabMode 
}) => {
  const [userDetails, setUserDetails] = useState<Map<string, UserType>>(new Map());
  const [loading, setLoading] = useState(false);

  // Function to get Users Details based on userId
  const fetchUserDetails = async (userIds: string[]) => {
    if (userIds.length === 0) return;
    
    setLoading(true);
    try {
      const users = await UserFetcher.getUsersByIds(userIds);
      const userMap = new Map<string, UserType>();
      users.forEach(user => {
        userMap.set(user.id, user);
      });
      setUserDetails(userMap);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Participants: Received participants update", participants);
    if (isCollabMode && participants.length > 0) {
      fetchUserDetails(participants);
    }
  }, [participants, isCollabMode]);

  if (!isCollabMode) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (userId: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getUserDisplayName = (userId: string) => {
    const user = userDetails.get(userId);
    return user ? user.name || user.username : 'Loading...';
  };

  const getUserInitials = (userId: string) => {
    const user = userDetails.get(userId);
    if (!user) return '...';
    
    if (user.name) {
      return getInitials(user.name);
    }
    return user.username ? user.username.charAt(0).toUpperCase() : 'U';
  };

  return (
    <Card className="w-64 bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Users className="w-4 h-4" />
          Participants ({participants.length})
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {participants.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">
            <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No other participants yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {participants.map((userId) => (
              <div
                key={userId}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  userId === currentUserId 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback 
                    className={`text-white text-xs font-medium ${getRandomColor(userId)}`}
                  >
                    {getUserInitials(userId)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getUserDisplayName(userId)}
                  </p>
                  {userId === currentUserId && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  userId === currentUserId ? 'bg-blue-500' : 'bg-green-500'
                }`} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Participants; 