'use client'
import dynamic from 'next/dynamic'

const FormularioEncuesta = dynamic(
  () => import('@/components/encuesta/FormularioEncuesta'),
  { ssr: false }
)

export default function EncuestaLoader(props) {
  return <FormularioEncuesta {...props} />
}

