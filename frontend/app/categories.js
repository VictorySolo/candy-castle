document.addEventListener("DOMContentLoaded", () => {
  const categoryList = document.getElementById("category-list");
  const createCategoryBtn = document.getElementById("create-category-btn");
  const categoryFormSection = document.getElementById("category-form-section");
  const categoryForm = document.getElementById("category-form");

  let isAdmin = false;
  let isEditing = false;
  let currentCategoryId = null;

  // Function to check if the user is an admin
  async function checkAdminStatus() {
    try {
      const authResponse = await fetch("/isLoggedIn");
      const authData = await authResponse.json();
      isAdmin = authData.isAdmin;
      if (isAdmin) {
        createCategoryBtn.style.display = "block";
      } else {
        createCategoryBtn.style.display = "none";
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  }

  // Function to fetch and display categories
  async function fetchCategories() {
    try {
      const response = await fetch("/categories");
      const categories = await response.json();

      categoryList.innerHTML = "";
      categories.forEach((category) => {
        const categoryElement = document.createElement("div");
        categoryElement.className = "category-item";
        categoryElement.innerHTML = `
            <h3>${category.name}</h3>
            <p>${category.description}</p>
            ${
              isAdmin
                ? `<button onclick="editCategory('${category._id}')">Edit</button>
                         <button onclick="deleteCategory('${category._id}')">Delete</button>`
                : ""
            }
          `;
        categoryList.appendChild(categoryElement);
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  // Function to create a new category
  async function createCategory(event) {
    event.preventDefault();

    const formData = new FormData(categoryForm);
    const categoryData = {
      name: formData.get("name"),
      description: formData.get("description"),
    };

    try {
      const response = await fetch("/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        fetchCategories();
        categoryForm.reset();
        categoryFormSection.style.display = "none";
      } else {
        console.error("Error creating category:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  }

  // Function to edit a category
  window.editCategory = async (categoryId) => {
    isEditing = true;
    currentCategoryId = categoryId;
    try {
      const response = await fetch(`/categories/${categoryId}`);
      const category = await response.json();

      document.getElementById("category-name").value = category.name;
      document.getElementById("category-description").value =
        category.description;

      categoryForm.removeEventListener("submit", createCategory);
      categoryForm.addEventListener("submit", updateCategory);

      categoryFormSection.style.display = "block";
    } catch (error) {
      console.error("Error fetching category details:", error);
    }
  };

  // Function to update a category
  async function updateCategory(event) {
    event.preventDefault();

    const formData = new FormData(categoryForm);
    const updatedCategoryData = {
      name: formData.get("name"),
      description: formData.get("description"),
    };

    try {
      const updateResponse = await fetch(`/categories/${currentCategoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCategoryData),
      });

      if (updateResponse.ok) {
        fetchCategories();
        categoryForm.reset();
        categoryFormSection.style.display = "none";
        isEditing = false;
        currentCategoryId = null;
      } else {
        console.error("Error updating category:", updateResponse.statusText);
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  }

  // Function to delete a category
  window.deleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCategories();
      } else {
        console.error("Error deleting category:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Show create category form on button click
  createCategoryBtn.addEventListener("click", () => {
    categoryForm.reset();
    categoryForm.removeEventListener("submit", updateCategory);
    categoryForm.addEventListener("submit", createCategory);
    categoryFormSection.style.display = "block";
    categoryList.appendChild(categoryFormSection); // Append form section to category list
  });

  // Initial function calls
  checkAdminStatus();
  fetchCategories();
});
