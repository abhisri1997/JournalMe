import React, { createContext, useContext, useCallback, useState } from "react";

interface FollowRequestContextType {
  refreshCount: number;
  refreshFollowRequests: () => void;
}

const FollowRequestContext = createContext<
  FollowRequestContextType | undefined
>(undefined);

export const FollowRequestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshFollowRequests = useCallback(() => {
    setRefreshCount((prev) => prev + 1);
  }, []);

  return (
    <FollowRequestContext.Provider
      value={{ refreshCount, refreshFollowRequests }}
    >
      {children}
    </FollowRequestContext.Provider>
  );
};

export const useFollowRequests = () => {
  const context = useContext(FollowRequestContext);
  if (!context) {
    throw new Error(
      "useFollowRequests must be used within FollowRequestProvider"
    );
  }
  return context;
};
