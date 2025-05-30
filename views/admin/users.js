<%- include('../components/template') %>
<main id="content">
  <div class="bg-purple-700">
    <div class="sm:flex sm:items-center px-8 pt-4">
      <div class="sm:flex-auto">
        <h1 class="text-base font-medium leading-6 text-white"><%= req.translations.users %></h1>
        <p class="mt-1 tracking-tight text-sm text-neutral-100">
          <%= req.translations.usersDescription %>
        </p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <button
          id="createButton"
          type="button"
          class="block rounded-xl bg-white px-3 py-2 text-center text-sm font-medium text-neutral-800 shadow-lg hover:bg-neutral-200 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
         <%= req.translations.createUserButton %>
        </button>
      </div>
    </div>
    <div id="nodeTable" class="mt-6 w-full">
      <table class="mt-6 w-full whitespace-nowrap text-left bg-purple-800 rounded-xl">
        <colgroup>
          <col class="w-full sm:w-4/12" />
          <col class="lg:w-4/12" />
          <col class="lg:w-2/12" />
          <col class="lg:w-4/12" />
          <col class="lg:w-1/12" />
          <col class="lg:w-1/12" />
        </colgroup>
        <thead class="border-b border-white/5 text-sm leading-6 text-white bg-purple-900">
          <tr>
            <th
              scope="col"
              class="py-2 pl-0 pr-8 font-medium sm:pl-80 lg:pl-8"
            >
            <%= req.translations.name %>
            </th>
            <th
            scope="col"
            class="py-2 pl-0 pr-8 font-medium sm:pl-80 lg:pl-8"
          >
          <%= req.translations.email %>
          </th>
            <th scope="col" class="py-2 pl-0 pr-8 font-medium sm:table-cell">
              <%= req.translations.information %>
            </th>
            <th
              scope="col"
              class="py-2 pl-0 pr-8 font-medium md:table-cell lg:pr-20"
            >
            <%= req.translations.role %>
            </th>
            <th
              scope="col"
              class="py-2 pl-0 pr-8 font-medium md:table-cell lg:pr-20"
            >
            <%= req.translations.verificationStatus %>
            </th>
            <th
              scope="col"
              class="py-2 pl-0 pr-8 font-medium md:table-cell lg:pr-20"
            >
            <%= req.translations.actions %>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <% users.forEach(function(user) { %>
          <tr class="bg-purple-700 hover:bg-purple-600 transition">
            <td class="py-4 pl-4 pr-8 sm:pl-8 lg:pl-8">
              <div class="flex items-center gap-x-4">
                <img
                  class="h-8 w-8 rounded-xl bg-purple-800"
                  src="https://api.dicebear.com/9.x/thumbs/svg?seed=<%= user.username %>"
                  alt=""
                />
                <div class="truncate text-sm font-medium leading-6 text-white">
                  <%= user.username %>
                </div>
              </div>
            </td>
            <td class="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
              <div class="flex gap-x-3 pl-8">
                <div
                  class="rounded-xl bg-purple-900 px-2 py-1 text-xs font-medium text-neutral-100 ring-1 ring-inset ring-white/10"
                >
                  <%= user.email %>
                </div>
              </div>
            </td>
            <td class="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
              <div class="flex gap-x-3">
                <div
                  class="rounded-xl bg-purple-900 px-2 py-1 text-xs font-medium text-neutral-100 ring-1 ring-inset ring-white/10"
                >
                  <%= user.userId %>
                </div>
              </div>
            </td>

            <% if (user.admin==true) { %>
            <td
              class="hidden py-4 pl-0 pr-8 text-sm leading-6 text-neutral-100 md:table-cell lg:pr-20"
            >
            <%= req.translations.admin %>
            </td>
            <% } else if (user.admin==false) { %>
            <td
              class="hidden py-4 pl-0 pr-8 text-sm leading-6 text-neutral-100 md:table-cell lg:pr-20"
            >
            <%= req.translations.regularUserRole %>
            </td>
            <% } %>

            <% if (user.verified==true) { %>
              <td
                class="hidden py-4 pl-0 pr-8 text-sm leading-6 text-green-300 md:table-cell lg:pr-20"
              >
              <%= req.translations.verifiedStatus %>
              </td>
              <% } else if (user.verified==false) { %>
              <td
                class="hidden py-4 pl-0 pr-8 text-sm leading-6 text-red-300 md:table-cell lg:pr-20"
              >
              <%= req.translations.unverifiedStatus %>
              </td>
            <% } else { %>
            <td
              class="hidden py-4 pl-0 pr-8 text-sm leading-6 text-neutral-100 md:table-cell lg:pr-20"
            >
            <%= req.translations.error %>
            </td>
            <% } %>
            <td
              class="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20 flex gap-3"
            >
              <div class="inner">
                <a href="/admin/users/edit/<%= user.userId %>"
                  ><button
                    id="editButton"
                    type="button"
                    class="block rounded-xl bg-white px-3 py-2 text-center text-sm font-medium text-neutral-800 shadow-lg hover:bg-neutral-50 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                  <%= req.translations.edit %>
                  </button></a
                >
              </div>
              <div class="inner">
                <button
                  id="removeButton"
                  type="button"
                  class="removeButton block rounded-xl bg-red-600 px-3 py-2 text-center text-sm font-medium text-white shadow-lg hover:bg-red-500 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  data-user-id="<%= user.userId %>"                
                  >
                  <%= req.translations.remove %>
                </button>
              </div>
            </td>
          </tr>
          <% }); %>
        </tbody>
      </table>
    </div>
    <div id="nodeForm" class="mt-6 px-8 w-full hidden">
      <form class="bg-purple-800 rounded-xl p-6">
        <label class="text-neutral-100 text-sm tracking-tight mb-2"
          ><%= req.translations.username %>:</label
        >
        <input
          id="userName"
          type="text"
          name="username"
          class="rounded-xl focus:ring-transparent focus:border-transparent text-white text-sm mt-2 mb-6 w-96 items-center transition justify-left gap-16 bg-purple-700 hover:bg-purple-600 px-4 py-2 flex border-white/5"
          placeholder="<%= req.translations.usernamePlaceholder %>"
        />
        <input
          id="email"
          type="email"
          name="email"
          class="rounded-xl focus:ring-transparent focus:border-transparent text-white text-sm mt-2 mb-6 w-96 items-center transition justify-left gap-16 bg-purple-700 hover:bg-purple-600 px-4 py-2 flex border-white/5"
          placeholder="<%= req.translations.emailPlaceholder %>"
        />

        <label class="text-neutral-100 text-sm tracking-tight mb-2"
          ><%= req.translations.passwordLabel %>:</label
        >
        <input
          id="userPass"
          type="password"
          name="password"
          class="rounded-xl focus:ring-transparent focus:border-transparent text-white text-sm mt-2 mb-6 w-96 items-center transition justify-left gap-16 bg-purple-700 hover:bg-purple-600 px-4 py-2 flex border-white/5"
          placeholder="******"
        />

        <label class="text-neutral-100 text-sm tracking-tight mb-2"
          ><%= req.translations.admin %>:</label
        >
        <select
          id="userAdmin"
          name="admin"
          class="rounded-xl focus:ring-transparent focus:border-transparent text-white text-sm mt-2 mb-6 w-96 items-center transition justify-left gap-16 bg-purple-700 hover:bg-purple-600 px-4 py-2 flex border-white/5"
        >
          <option value="true"><%= req.translations.true %></option>
          <option value="false"><%= req.translations.false %></option>
        </select>

        <label class="text-neutral-100 text-sm tracking-tight mb-2"><%= req.translations.verifiedStatus %>:</label>
        <select
          id="userVerified"
          name="verified"
          class="rounded-xl focus:ring-transparent focus:border-transparent text-white text-sm mt-2 mb-6 w-96 items-center transition justify-left gap-16 bg-purple-700 hover:bg-purple-600 px-4 py-2 flex border-white/5"
        >
        <option value="true"><%= req.translations.true %></option>
        <option value="false"><%= req.translations.false %></option>
        </select>
        <!-- <label class="text-neutral-400 text-sm tracking-tight mb-2">Tags:</label>
         <input id="nodeTags" class="rounded-xl focus:ring-transparent focus:border-transparent text-white text-sm mt-2 mb-6 w-96 items-center transition justify-left gap-16 hover:bg-white/5 px-4 py-2[...]

         <label class="text-neutral-400 text-sm tracking-tight mb-2">RAM (GB):</label>
         <input id="nodeRam" class="rounded-xl focus:ring-transparent focus:border-transparent text-white text-sm mt-2 mb-6 w-96 items-center transition justify-left gap-16 hover:bg-white/5 px-4 py-2 [...]

         <label class="text-neutral-400 text-sm tracking-tight mb-2">Disk (GB):</label>
         <input id="nodeDisk" class="rounded-xl focus:ring-transparent focus:border-transparent text-white text-sm mt-2 mb-6 w-96 items-center transition justify-left gap-16 hover:bg-white/5 px-4 py-2[...]

         <label class="text-neutral-400 text-sm tracking-tight mb-2">Processor:</label>
         <input id="nodeProcessor" class="rounded-xl focus:ring-transparent focus:border-transparent text-white text-sm mt-2 mb-6 w-96 items-center transition justify-left gap-16 hover:bg-white/5 px-4[...]

         <label class="text-neutral-400 text-sm tracking-tight mb-2">IP Address:</label>
         <input id="nodeAddress" class="rounded-xl focus:ring-transparent focus:border-transparent text-white text-sm mt-2 mb-6 w-96 items-center transition justify-left gap-16 hover:bg-white/5 px-4 p[...]

         <label class="text-neutral-400 text-sm tracking-tight mb-2">Daemon Port:</label>
         <input id="nodePort" class="rounded-xl focus:ring-transparent focus:border-transparent text-white text-sm mt-2 mb-6 w-96 items-center transition justify-left gap-16 hover:bg-white/5 px-4 py-2[...]

         <label class="text-neutral-400 text-sm tracking-tight mb-2">Access Key:</label>
         <input id="nodeApiKey" class="rounded-xl focus:ring-transparent focus:border-transparent text-white text-sm mt-2 mb-6 w-96 items-center transition justify-left gap-16 hover:bg-white/5 px-4 py[...]

        <button
          id="createNodeBtn"
          type="button"
          class="block rounded-xl bg-white px-3 py-2 text-center text-sm font-medium text-neutral-800 shadow-lg hover:bg-neutral-200 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
        <%= req.translations.create %>
        </button>
      </form>
    </div>
  </div>
</main>
<script>
  document
    .getElementById("createButton")
    .addEventListener("click", function () {
      var table = document.getElementById("nodeTable");
      var form = document.getElementById("nodeForm");
      if (table.style.display !== "none") {
        table.style.display = "none";
        form.style.display = "block";
      } else {
        table.style.display = "block";
        form.style.display = "none";
      }
    });
</script>
<script>
  document
    .getElementById("createNodeBtn")
    .addEventListener("click", function () {
      const username = document.getElementById("userName").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("userPass").value;
      const adminString = document.getElementById("userAdmin").value;
      const admin = adminString === "true";

      const nodeData = {
        username,
        email,
        password,
        admin,
        verified: false,
      };

      console.log(nodeData);

      fetch("/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nodeData),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Failed to create user");
        })
        .then((data) => {
          console.log("user created:", data);
          alert('<%= req.translations.userCreatedSuccess %>');
          window.location.reload();
        })
        .catch((error) =>
          alert('<%= req.translations.userCreateError %>: ' + error.message)
        );
    });
</script>
<!-- remove -->
<script>
  document.querySelectorAll('.removeButton').forEach(button => {
    button.addEventListener('click', function() {
      const userId = this.dataset.userId;
      const totalUsers = document.querySelectorAll('.removeButton').length;
      if (totalUsers === 1) {
        alert('<%= req.translations.databaseCannotDelete %>');
        return;
      }
      const currentUserId = '<%= user.userId %>';
      if (userId === currentUserId) {
        alert('<%= req.translations.userCannotDelete %>');
        return;
      }
      const confirmation = confirm('<%= req.translations.userDeletingConfirmation %>');
      if (!confirmation) return;

      fetch('/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      })
      .then(response => {
        if (response.ok) {
          window.location.reload();
        } else {
          throw new Error('Failed to delete user');
        }
      })
      .catch(error => alert('<%= req.translations.userDeletingError %>' + error.message));
    });
  });
</script>

<%- include('../components/footer') %>
