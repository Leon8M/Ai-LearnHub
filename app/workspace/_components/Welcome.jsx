import React from 'react';
import { Smile } from 'lucide-react';

function Welcome() {
  const hours = new Date().getHours();
  const greeting =
    hours < 12 ? 'Good morning' :
    hours < 18 ? 'Good afternoon' :
    'Good evening';

  return (
    <div className="bg-gradient-to-br from-[#00F5A0]/80 to-[#00D9F5]/80 p-6 rounded-2xl shadow-2xl text-[#111]">
      <div className="flex items-center space-x-4">
        <div className="bg-white rounded-full p-3 shadow-md">
          <Smile className="text-[#00F5A0]" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{greeting}, welcome to your AI workspace!</h1>
          <p className="mt-1 text-base text-black/80">
            Ready to learn something new today?
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-2 text-sm text-black/70">
        <p>📚 Explore AI-powered courses tailored for you.</p>
        <p>🎯 Track your progress and get smart recommendations.</p>
        <p>✨ Create your own curriculum — your pace, your rules.</p>
      </div>
    </div>
  );
}

export default Welcome;
