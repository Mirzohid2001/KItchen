import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserHealthProfile } from '../types/health';
import { User } from '../types/recipe';

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateHealthProfile: (healthProfile: UserHealthProfile) => void;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
  hasActiveTrial: boolean;
  hasPremiumAccess: boolean; // подписка ИЛИ пробный период
  activateSubscription: () => void;
  activateTrialPeriod: () => void;
  isAdmin: boolean;
  trialDaysLeft: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  // Загружаем пользователя и пробуем восстановить сессию при инициализации
  useEffect(() => {
    // 1. Пробуем восстановить пользователя из localStorage (быстрый путь)
    const savedUser = localStorage.getItem('ai-chef-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('🔄 [UserContext] Loaded user from localStorage:', {
          id: parsedUser.id,
          email: parsedUser.email,
          role: parsedUser.role,
          idType: typeof parsedUser.id
        });
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('ai-chef-user');
      }
    }

    // 2. Проверяем, есть ли access token, и валидируем его через backend
    const restoreSessionFromBackend = async () => {
      let accessToken = null;
      try {
        accessToken = localStorage.getItem('access-token');
      } catch (error) {
        console.error('❌ [UserContext] Failed to read access token from localStorage:', error);
      }

      if (!accessToken) {
        return;
      }

      try {
        // Пробуем получить текущего пользователя по access token
        let meResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        // Если access token истёк, пробуем обновить через refresh cookie
        if (meResponse.status === 401) {
          console.log('🔄 [UserContext] Access token expired, trying refresh...');
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST'
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.accessToken) {
              accessToken = refreshData.accessToken;
              try {
                localStorage.setItem('access-token', accessToken);
              } catch (storageError) {
                console.error('❌ [UserContext] Failed to save refreshed access token:', storageError);
              }

              meResponse = await fetch('/api/auth/me', {
                headers: {
                  'Authorization': `Bearer ${accessToken}`
                }
              });
            } else {
              console.warn('⚠️ [UserContext] Refresh response without accessToken');
            }
          } else {
            console.warn('⚠️ [UserContext] Refresh token request failed with status:', refreshResponse.status);
          }
        }

        if (meResponse.ok) {
          const me = await meResponse.json();
          console.log('✅ [UserContext] Restored session from backend:', {
            id: me.id,
            email: me.email,
            role: me.role
          });

          // Мягко объединяем данные из backend с локальными (healthProfile, подписка и т.п.)
          // ВАЖНО: нормализуем id - убеждаемся, что это число
          const normalizedMe = {
            ...me,
            id: typeof me.id === 'string' ? parseInt(me.id, 10) : me.id
          };
          
          setUser((prev) => {
            if (!prev) return normalizedMe;
            return {
              ...prev,
              ...normalizedMe,
              // Сохраняем локальные данные (healthProfile, подписка) если они есть
              healthProfile: prev.healthProfile || normalizedMe.healthProfile,
            };
          });
          
          // Обновляем localStorage с нормализованными данными
          try {
            localStorage.setItem('ai-chef-user', JSON.stringify(normalizedMe));
          } catch (error) {
            console.error('❌ [UserContext] Failed to update localStorage:', error);
          }
        } else if (meResponse.status === 401) {
          console.log('⚠️ [UserContext] No valid session on backend, clearing access token');
          try {
            localStorage.removeItem('access-token');
          } catch (error) {
            console.error('❌ [UserContext] Failed to remove access token from localStorage:', error);
          }
        }
      } catch (error) {
        console.error('❌ [UserContext] Error restoring session from backend:', error);
      }
    };

    restoreSessionFromBackend();
  }, []);

  const login = async (userData: User) => {
    console.log('🔑 [UserContext] Login called with userData:', {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      idType: typeof userData.id
    });

    try {
      // Load health profile from server
      const healthResponse = await fetch(`/api/health-profile/${userData.id}`);
      let healthProfile = null;

      if (healthResponse.ok) {
        healthProfile = await healthResponse.json();
        console.log('✅ [UserContext] Health profile loaded from server for user:', userData.id);
      } else {
        console.warn('⚠️ [UserContext] Failed to load health profile from server, using default');
        healthProfile = {
          conditions: [],
          dietaryRestrictions: [],
          allergies: [],
          notes: ''
        };
      }

      // Merge user data with health profile
      const completeUserData = { ...userData, healthProfile };

      // Если это администратор, добавляем Premium подписку
      if (completeUserData.role === 'admin') {
        const adminUser = {
          ...completeUserData,
          subscription: {
            active: true,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            plan: 'premium' as const
          }
        };
        console.log('👑 [UserContext] Admin user created:', { id: adminUser.id, email: adminUser.email });
        setUser(adminUser);
        localStorage.setItem('ai-chef-user', JSON.stringify(adminUser));
      } else {
        console.log('👤 [UserContext] Regular user set:', { id: completeUserData.id, email: completeUserData.email });
        setUser(completeUserData);
        localStorage.setItem('ai-chef-user', JSON.stringify(completeUserData));
      }
    } catch (error) {
      console.error('❌ [UserContext] Error loading health profile:', error);

      // Fallback: proceed without health profile
      if (userData.role === 'admin') {
        const adminUser = {
          ...userData,
          subscription: {
            active: true,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            plan: 'premium' as const
          }
        };
        setUser(adminUser);
        localStorage.setItem('ai-chef-user', JSON.stringify(adminUser));
      } else {
        setUser(userData);
        localStorage.setItem('ai-chef-user', JSON.stringify(userData));
      }
    }
  };

  const logout = () => {
    try {
      // Оповещаем backend, чтобы он очистил refresh cookie
      fetch('/api/auth/logout', { method: 'POST' }).catch((error) => {
        console.error('❌ [UserContext] Logout request failed:', error);
      });
    } catch (error) {
      console.error('❌ [UserContext] Failed to call logout endpoint:', error);
    }

    setUser(null);

    try {
      localStorage.removeItem('ai-chef-user');
      localStorage.removeItem('access-token');
    } catch (error) {
      console.error('❌ [UserContext] Failed to clear localStorage on logout:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('ai-chef-user', JSON.stringify(updatedUser));
    }
  };

  const updateHealthProfile = async (healthProfile: UserHealthProfile) => {
    if (user) {
      try {
        // Save to server
        const response = await fetch(`/api/health-profile/${user.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(healthProfile),
        });

        if (!response.ok) {
          throw new Error('Failed to save health profile to server');
        }

        // Update local state
        const updatedUser = { ...user, healthProfile };
        setUser(updatedUser);

        console.log('✅ [UserContext] Health profile saved to server for user:', user.id);
      } catch (error) {
        console.error('❌ [UserContext] Error saving health profile:', error);

        // Fallback: save to localStorage if server fails
        const updatedUser = { ...user, healthProfile };
        setUser(updatedUser);
        localStorage.setItem('ai-chef-user', JSON.stringify(updatedUser));
        console.log('⚠️ [UserContext] Saved health profile to localStorage as fallback');
      }
    }
  };

  const activateSubscription = () => {
    if (user) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      const updatedUser = {
        ...user,
        subscription: {
          active: true,
          expiresAt: expiresAt.toISOString(),
          plan: 'premium' as const
        }
      };
      setUser(updatedUser);
      localStorage.setItem('ai-chef-user', JSON.stringify(updatedUser));
    }
  };

  // Активация пробного периода на 3 дня
  const activateTrialPeriod = () => {
    if (user) {
      // Проверяем, не был ли уже активирован пробный период
      if (user.trialPeriod?.active) {
        console.log('Пробный период уже активирован');
        return;
      }

      const startedAt = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3); // 3 дня пробного периода

      const updatedUser = {
        ...user,
        trialPeriod: {
          active: true,
          startedAt: startedAt.toISOString(),
          expiresAt: expiresAt.toISOString()
        }
      };

      setUser(updatedUser);
      localStorage.setItem('ai-chef-user', JSON.stringify(updatedUser));

      console.log('Пробный период активирован на 3 дня:', {
        startedAt: startedAt.toISOString(),
        expiresAt: expiresAt.toISOString()
      });
    }
  };

  const isAdmin = user?.role === 'admin';

  const hasActiveSubscription = !!(
    user?.subscription?.active &&
    user?.subscription?.expiresAt &&
    new Date(user.subscription.expiresAt) > new Date()
  );

  // Проверка активного пробного периода
  const hasActiveTrial = !!(
    user?.trialPeriod?.active &&
    user?.trialPeriod?.expiresAt &&
    new Date(user.trialPeriod.expiresAt) > new Date()
  );

  // Расчет оставшихся дней пробного периода
  const trialDaysLeft = user?.trialPeriod?.active && user?.trialPeriod?.expiresAt
    ? Math.max(0, Math.ceil((new Date(user.trialPeriod.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Проверка доступа к премиум-функциям (подписка ИЛИ пробный период)
  const hasPremiumAccess = hasActiveSubscription || hasActiveTrial || isAdmin;

  const value = {
    user,
    login,
    logout,
    updateUser,
    updateHealthProfile,
    isAuthenticated: !!user,
    hasActiveSubscription,
    hasActiveTrial,
    hasPremiumAccess,
    activateSubscription,
    activateTrialPeriod,
    isAdmin,
    trialDaysLeft,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};



