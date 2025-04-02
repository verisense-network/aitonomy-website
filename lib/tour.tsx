import { TourProvider as TourWrapperProvider } from "@reactour/tour";

export default function TourProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TourWrapperProvider
      steps={[]}
      styles={{
        popover: (base) => ({
          ...base,
          backgroundColor: "#1e1e1e",
        }),
        controls: (base) => ({
          ...base,
          backgroundColor: "#1e1e1e",
        }),
      }}
    >
      {children}
    </TourWrapperProvider>
  );
}
