import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Plans from "./Plans";

// Mock the plan service
jest.mock("../../services/planService", () => ({
  getPlansWithSubscribers: jest.fn(),
  createPlan: jest.fn(),
  updatePlan: jest.fn(),
  deletePlan: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock react-icons
jest.mock("react-icons/ri", () => ({
  RiAddLine: () => <div>Add Icon</div>,
  RiEdit2Line: () => <div>Edit Icon</div>,
  RiDeleteBinLine: () => <div>Delete Icon</div>,
  RiCheckLine: () => <div>Check Icon</div>,
  RiCloseLine: () => <div>Close Icon</div>,
  RiGroupLine: () => <div>Group Icon</div>,
  RiUserLine: () => <div>User Icon</div>,
  RiTimeLine: () => <div>Time Icon</div>,
}));

const mockPlans = [
  {
    id: 1,
    _id: 1,
    name: "Basic Plan",
    description: "Basic plan description",
    price: 100,
    interval: "monthly",
    features: {
      users: 1,
      support: "email",
      featured: 0,
      listings: 5,
      analytics: false,
    },
    status: "active",
    subscribers: 10,
    totalSubscriptions: 15,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    _id: 2,
    name: "Premium Plan",
    description: "Premium plan description",
    price: 500,
    interval: "monthly",
    features: {
      users: 5,
      support: "chat",
      featured: 2,
      listings: "unlimited", // Unlimited listings
      analytics: true,
    },
    status: "active",
    subscribers: 5,
    totalSubscriptions: 8,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

// Import the mocked functions
const planService = require("../../services/planService");

describe("Plans Component", () => {
  beforeEach(() => {
    planService.getPlansWithSubscribers.mockResolvedValue(mockPlans);
    planService.createPlan.mockResolvedValue({ success: true });
    planService.updatePlan.mockResolvedValue({ success: true });
    planService.deletePlan.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders plans with unlimited listings correctly", async () => {
    render(<Plans />);

    await waitFor(() => {
      expect(screen.getByText("Basic Plan")).toBeInTheDocument();
      expect(screen.getByText("Premium Plan")).toBeInTheDocument();
    });

    // Check that unlimited listings are displayed correctly
    expect(screen.getByText("Max Listings: 5")).toBeInTheDocument();
    expect(screen.getByText("Max Listings: Unlimited")).toBeInTheDocument();
  });

  test("opens add modal with unlimited listings option", async () => {
    render(<Plans />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add new plan/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /add new plan/i }));

    await waitFor(() => {
      expect(screen.getByText("Unlimited Listings")).toBeInTheDocument();
    });
  });

  test("toggles unlimited listings checkbox", async () => {
    render(<Plans />);

    await waitFor(() => {
      expect(screen.getByText("Add New Plan")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Add New Plan"));

    await waitFor(() => {
      const unlimitedCheckbox = screen.getByRole("checkbox", {
        name: /unlimited listings/i,
      });
      const listingsInput = screen.getByPlaceholderText("e.g., 2");

      expect(unlimitedCheckbox).not.toBeChecked();
      expect(listingsInput).toBeInTheDocument();

      // Toggle unlimited listings
      fireEvent.click(unlimitedCheckbox);

      expect(unlimitedCheckbox).toBeChecked();
      expect(screen.queryByPlaceholderText("e.g., 2")).not.toBeInTheDocument();
    });
  });

  test("opens edit modal with unlimited listings pre-selected", async () => {
    render(<Plans />);

    await waitFor(() => {
      expect(screen.getByText("Premium Plan")).toBeInTheDocument();
    });

    // Find and click the edit button for the Premium Plan (which has unlimited listings)
    const editButtons = screen.getAllByText("Edit Icon");
    fireEvent.click(editButtons[1]); // Second plan (Premium)

    await waitFor(() => {
      const unlimitedCheckbox = screen.getByRole("checkbox", {
        name: /unlimited listings/i,
      });
      expect(unlimitedCheckbox).toBeChecked();
      expect(screen.queryByPlaceholderText("e.g., 2")).not.toBeInTheDocument();
    });
  });

  test("submits form with unlimited listings", async () => {
    render(<Plans />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add new plan/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /add new plan/i }));

    await waitFor(() => {
      // Fill in required fields using more specific selectors
      fireEvent.change(screen.getByLabelText(/plan name/i), {
        target: { value: "Test Plan" },
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: "Test Description" },
      });
      fireEvent.change(screen.getByLabelText(/price/i), {
        target: { value: "100" },
      });
      fireEvent.change(screen.getByLabelText(/max users/i), {
        target: { value: "5" },
      });

      // Toggle unlimited listings
      const unlimitedCheckbox = screen.getByRole("checkbox", {
        name: /unlimited listings/i,
      });
      fireEvent.click(unlimitedCheckbox);

      // Submit form
      fireEvent.click(screen.getByRole("button", { name: /add plan/i }));
    });

    await waitFor(() => {
      expect(planService.createPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          features: expect.objectContaining({
            listings: "unlimited", // Should be "unlimited" for unlimited
          }),
        })
      );
    });
  });
});
