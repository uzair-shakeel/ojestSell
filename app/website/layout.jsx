import Navbar from "../../components/website/Navbar";
import { Footer } from "../../components/website/footer";

export default function WebsiteLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen h-auto w-full">
      <Navbar />
      {/* Main content adjusts dynamically */}
      <main className={`flex-1 flex h-auto w-full`}>
        <div className="w-full">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
