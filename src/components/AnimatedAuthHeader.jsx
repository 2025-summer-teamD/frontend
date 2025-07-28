import React from 'react';
import { User } from 'lucide-react';
import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/clerk-react';


const AnimatedAuthHeader = () => {
  return (
  <div className="flex items-center">
      <SignedOut>
        <SignInButton mode="modal">
        <button className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
            <User size={24} color="#ffffff" />
        </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton />
      </SignedIn>
  </div>
  );
};

export default AnimatedAuthHeader;
