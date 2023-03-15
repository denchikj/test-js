let state = {
  station: "svo",
  direction: "departure",
  date: ((x, z) =>
    x.getFullYear() + "-" + z(x.getMonth() + 1) + "-" + z(x.getDate()))(
    new Date(),
    (x) => (x < 10 ? "0" + x : x)
  ),
};

let info = {};
let list = document.querySelector(".list");

document.addEventListener("DOMContentLoaded", start);
document.querySelector(".airports").addEventListener("click", set_airport);
document.querySelector(".direction").addEventListener("click", set_direction);
document.querySelector(".search").addEventListener("click", search);
document.querySelector(".show_all").addEventListener("click", show_all);

function start() {
  state.apikey = prompt("Введите ключ API Яндекс Расписаний");
  refresh();
}

function refresh() {
  data = update();
  let f_list = [];
  if (data) {
    for (flight of data) {
      let _data = {
        time: flight[state.direction]
          .split("T")[1]
          .split("+")[0]
          .split(":")
          .slice(0, -1)
          .join(":"),
        city: flight.thread.title.split(" — ")[
          state.direction == "arrival" ? 0 : 1
        ],
        number: flight.thread.number,
      };
      f_list.push(_data);
    }
    uniq_data = {};
    for (item of f_list) {
      key = item.time + item.city;
      numbers = uniq_data[key];
      uniq_data[key] = numbers ? [...numbers, item.number] : [item.number];
    }
    f_list = [];
    for (key in uniq_data) {
      f_list.push({
        time: key.slice(0, 5),
        city: key.slice(5),
        numbers: [...new Set(uniq_data[key])],
      });
    }
    info[state.station + state.direction] = f_list;
  } else {
    f_list = info[state.station + state.direction];
  }
  list.innerHTML = f_list.map((e) => thread(e)).join("\n");
}

function thread(_data) {
  return `
      <div class="thread">
        <div class="time">${_data.time}</div>
        <div class="city">${_data.city}</div>
        <div class="flight">
          <div class="number">${_data.numbers.join(", ")}</div>
        </div>
      </div>
    `;
}

function update() {
  if (info[state.station + state.direction]) {
    return false;
  }

  ((xhr) => {
    request = `update?apikey=${state.apikey}&station=${state.station}&date=${state.date}&event=${state.direction}`;
    xhr.open("GET", request, false);
    xhr.send();
  })(new XMLHttpRequest());

  data = JSON.parse(
    ((xhr) => {
      xhr.open("GET", "data.json", false);
      xhr.send();
      return xhr.responseText;
    })(new XMLHttpRequest())
  );
  return data.schedule;
}

function set_airport(event) {
  elem = event.target;
  if (elem.className == "airports") return;
  set = document.querySelector(".airports");
  for (e of set.children) {
    e.removeAttribute("data-current-station");
  }
  state.station = elem.dataset.station;
  elem.setAttribute("data-current-station", "");
  refresh();
}

function set_direction(event) {
  elem = event.target;
  if (elem.className == "direction") return;
  set = document.querySelector(".direction");
  for (e of set.children) {
    e.removeAttribute("data-current-direction");
  }
  state.direction = elem.dataset.direction;
  elem.setAttribute("data-current-direction", "");
  refresh();
}

function search() {
  number = document.querySelector(".number > input").value;
  for (elem of list.children) {
    if (
      elem
        .querySelector(".number")
        .innerHTML.toLowerCase()
        .indexOf(number.toLowerCase()) !== -1
    ) {
      elem.style.display = "";
    } else {
      elem.style.display = "none";
    }
  }
}

function show_all() {
  document.querySelector(".number > input").value = "";
  for (elem of list.children) {
    elem.style.display = "";
  }
}
