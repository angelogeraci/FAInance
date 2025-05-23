import { render, screen } from '@testing-library/react'
import RootLayout from './layout'

function DummyChild () {
  return <div data-testid='dummy-child'>Hello</div>
}

describe('RootLayout', () => {
  it('renders ChakraProvider and children', () => {
    render(
      <RootLayout>
        <DummyChild />
      </RootLayout>
    )
    expect(screen.getByTestId('dummy-child')).toBeInTheDocument()
  })
}) 