import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  preferred_location_id?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<{ error: any | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cache profile in localStorage
  const cacheProfile = (profileData: UserProfile) => {
    try {
      localStorage.setItem('user_profile', JSON.stringify(profileData));
    } catch (error) {
      console.error('Error caching profile:', error);
    }
  };

  // Load profile from cache
  const loadCachedProfile = (userId: string): UserProfile | null => {
    try {
      const cached = localStorage.getItem('user_profile');
      if (cached) {
        const profileData = JSON.parse(cached) as UserProfile;
        // Only return cached profile if it's for the current user
        if (profileData.id === userId) {
          console.log('Profile loaded from cache:', profileData.full_name);
          return profileData;
        }
      }
    } catch (error) {
      console.error('Error loading cached profile:', error);
    }
    return null;
  };

  // Clear profile cache
  const clearProfileCache = () => {
    try {
      localStorage.removeItem('user_profile');
    } catch (error) {
      console.error('Error clearing profile cache:', error);
    }
  };

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile from database for user:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('Profile query completed:', { data: data?.full_name, error });

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        const profileData = data as UserProfile;
        console.log('Profile loaded from database:', profileData.full_name);
        setProfile(profileData);
        // Cache the profile for future use
        cacheProfile(profileData);
      } else {
        console.log('No profile data returned');
      }
    } catch (error) {
      console.error('Error in fetchProfile function:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        console.log('Initial session check:', { session: currentSession?.user?.id, error });
        
        if (error) {
          console.error('Error getting session:', error);
        }

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user || null);
          
          // If we have a session, load profile
          if (currentSession?.user) {
            console.log('Found existing session for user:', currentSession.user.id);
            
            // First try to load from cache
            const cachedProfile = loadCachedProfile(currentSession.user.id);
            if (cachedProfile) {
              setProfile(cachedProfile);
            } else {
              // Only fetch from database if not in cache
              await fetchProfile(currentSession.user.id);
            }
          } else {
            console.log('No existing session found');
            // Clear any cached profile if no session
            clearProfileCache();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          console.log('Auth initialization complete, setting loading to false');
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state change:', event, newSession?.user?.id);
      
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user || null);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        // Check cache first, then fetch from database if needed
        const cachedProfile = loadCachedProfile(newSession.user.id);
        if (cachedProfile) {
          setProfile(cachedProfile);
        } else {
          // Only fetch from database if not in cache
          await fetchProfile(newSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing profile and cache...');
        setProfile(null);
        clearProfileCache();
      }
      
      setIsLoading(false);
    });

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Refresh the user profile data
  const refreshProfile = async () => {
    if (user?.id) {
      // Clear cache and fetch fresh data
      clearProfileCache();
      setProfile(null);
      await fetchProfile(user.id);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            phone: userData.phone,
          },
        },
      });

      if (!error && data.user) {
        // Create profile in user_profiles table
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: data.user.id,
              email: email,
              full_name: userData.full_name,
              phone: userData.phone,
            }
          ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          return { error: profileError };
        }
      }

      return { error };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { error };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } catch (error) {
      console.error('Error during sign in:', error);
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Logout error:', error);
      return { error };
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}