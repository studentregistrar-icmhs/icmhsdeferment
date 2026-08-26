import "./globals.css";

export const metadata = {
  title: "ICMHS Enrollment Deferment Request",
  description: "Imperial College of Medical and Health Sciences — Office of Admissions & Records"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="brandbar" />
        {children}
      </body>
    </html>
  );
}
