import React from 'react';
import { User } from 'lucide-react';
import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/clerk-react';

const SimpleAuthHeader = () => {
  return (
    <header style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
      <SignedOut>
        <SignInButton mode="modal">
          <div style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={24} color="#ffffff" />
          </div>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
};

export default SimpleAuthHeader;
