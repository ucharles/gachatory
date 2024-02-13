import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom"; // Import the extend-expect module
import Home from "@/app/page";

describe("Home", () => {
  it("renders loading message", () => {
    render(<Home />); // arrange

    const linkElement = screen.getByText(/Loading/i); // act

    expect(linkElement).toBeInTheDocument(); // assert
  });
});
