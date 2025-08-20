'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Gem, LogOut, Trash2, Loader2, X, Check } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut, user: clerkUser } = useClerk();
  const [tokenBalance, setTokenBalance] = useState(0);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        setLoadingTokens(false);
        setTokenBalance(0);
        return;
      }

      setLoadingTokens(true);
      try {
        const res = await fetch('/api/user/tokens');
        const data = await res.json();

        if (res.ok) {
          setTokenBalance(data.tokens);
        } else {
          if (res.status === 404) {
            toast.info(data.error || 'User data not found. Token balance defaults to 0.');
            setTokenBalance(0);
          } else {
            toast.error(data.error || 'Failed to fetch token balance from server.');
            setTokenBalance(0);
          }
        }
      } catch (error) {
        //console.error('Error fetching token balance:', error);
        toast.error('Failed to fetch token balance due to a network error. Please check your connection.');
        setTokenBalance(0);
      } finally {
        setLoadingTokens(false);
      }
    };

    fetchTokenBalance();
  }, [isLoaded, isSignedIn, user]);

  const handleDeleteAccount = async () => {
    if (!clerkUser) {
      toast.error("User not found for deletion.");
      return;
    }

    setDeletingAccount(true);
    try {
      // Step 1: Delete user-related data from your Drizzle database
      const dbDeleteRes = await fetch('/api/user/delete-account-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: clerkUser.id }),
      });
      const dbDeleteData = await dbDeleteRes.json();

      if (!dbDeleteRes.ok || !dbDeleteData.success) {
        toast.error(dbDeleteData.error || 'Failed to delete data from Kamusi AI database. Please try again.');
        //console.error('Database deletion failed:', dbDeleteData.error);
        setDeletingAccount(false);
        return;
      }
      toast.success('Your Kamusi AI data has been deleted.');

      // Step 2: Delete the user from Clerk (this will sign them out)
      await clerkUser.destroy();
      toast.success('Your account has been successfully deleted. Goodbye!');

    } catch (error) {
      //console.error('Error deleting account:', error);
      toast.error('An error occurred during account deletion. Please try again.');
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false); // Close modal regardless
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-[var(--muted-foreground)]">
        <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading settings...
      </div>
    );
  }

  // Handle case where user is not signed in
  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4 text-center text-[var(--muted-foreground)]">
        <p className="text-xl mb-4">You need to be signed in to view settings.</p>
        <button
          onClick={() => signOut()}
          className="btn-primary px-6 py-3 rounded-lg text-lg bg-[var(--primary)] text-black hover:bg-opacity-90 transition-all duration-300"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="relative w-full px-4 py-16 md:px-8 md:py-24 bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2 className="text-[var(--primary)] uppercase text-base md:text-lg tracking-widest font-semibold text-center mb-3">
        Settings
      </motion.h2>
      <motion.h3 className="text-center text-3xl md:text-5xl font-extrabold mb-12 text-[var(--foreground)] max-w-3xl leading-tight">
        Manage Your Kamusi AI Account
      </motion.h3>

      <div className="max-w-3xl w-full space-y-8">
        {/* User Profile Card */}
        <motion.div
          className="bg-[var(--card)] rounded-xl p-6 md:p-8 shadow-sm border border-[var(--border)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h4 className="flex items-center gap-3 text-2xl font-bold text-[var(--foreground)] mb-4">
            <User className="w-6 h-6 text-[var(--primary)]" /> Profile Information
          </h4>
          <div className="space-y-3 text-[var(--muted-foreground)]">
            <p><strong>Name:</strong> {user.fullName || user.username || 'N/A'}</p>
            <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress || 'N/A'}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
        </motion.div>

        {/* Token Balance Card */}
        <motion.div
          className="bg-[var(--card)] rounded-xl p-6 md:p-8 shadow-sm border border-[var(--border)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h4 className="flex items-center gap-3 text-2xl font-bold text-[var(--foreground)] mb-4">
            <Gem className="w-6 h-6 text-[var(--primary)]" /> Your Tokens
          </h4>
          {loadingTokens ? (
            <p className="text-[var(--muted-foreground)] flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading balance...
            </p>
          ) : (
            <p className="text-3xl font-bold text-[var(--foreground)]">
              {tokenBalance} <span className="text-[var(--muted-foreground)] text-xl">tokens</span>
            </p>
          )}
        </motion.div>

        {/* Account Management Card */}
        <motion.div
          className="bg-[var(--card)] rounded-xl p-6 md:p-8 shadow-sm border border-[var(--border)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h4 className="flex items-center gap-3 text-2xl font-bold text-[var(--foreground)] mb-4">
            <Settings className="w-6 h-6 text-[var(--primary)]" /> Account Management
          </h4>
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <button
              onClick={() => signOut()}
              className="w-full md:w-auto px-6 py-3 text-lg font-bold text-black bg-[var(--primary)] rounded-md hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full md:w-auto px-6 py-3 text-lg font-bold bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" /> Delete Account
            </button>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[var(--card)] rounded-xl p-8 shadow-2xl max-w-md w-full border border-[var(--border)] text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <h4 className="text-2xl font-bold text-red-500 mb-4">Confirm Account Deletion</h4>
              <p className="text-[var(--muted-foreground)] mb-6">
                Are you sure you want to delete your Kamusi AI account? This action is irreversible and will delete all your associated data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deletingAccount}
                  className="px-6 py-3 text-lg font-bold bg-[var(--primary)] text-black rounded-md hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" /> Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className={`px-6 py-3 text-lg font-bold bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 ${
                    deletingAccount ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {deletingAccount ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" /> Confirm Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SettingsPage;
