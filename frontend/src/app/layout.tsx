import Header from './Header';
import Footer from './Footer';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col min-h-screen font-sans">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  )
}
