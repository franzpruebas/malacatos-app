import './globals.css'

export const metadata = {
  title: 'Malacatos — Levantamiento territorial',
  description: 'Sistema de levantamiento de segundas viviendas en Malacatos',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
