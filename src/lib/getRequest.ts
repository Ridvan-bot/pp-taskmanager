export const fetchTasksForCustomers = async (customers: string[]) => {
  for (const customer of customers) {
    try {
      const response = await fetch(`/api/task`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to fetch tasks for customer ${customer}:`, error);
    }
  }
};
