interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell = ({ children }: MobileShellProps) => {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-200">
      <div
        className="relative overflow-hidden bg-[#f6f7f8] flex flex-col"
        style={{ width: 393, height: 852, flexShrink: 0 }}
      >
        {children}
      </div>
    </main>
  );
};
