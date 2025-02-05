import { parkIcon, homeIcon, goToIcon, jobIcon } from "./constants.js"

// Note status değerine göre düzenleme yapma

const getStatus = (status) => {
    switch (status){
        case "goto":
            return "Ziyaret"
        case "home":
            return "Ev"
        case "park":
            return "Park Yeri"
        case "job":
            return "İş"

            default:
                return "Tanımsız durum;"
    }
}

// Her status için gerekli icona karar veren fonskiyo

const getNoteIcon = (status) => {
    switch (status) {
      case "goto":
        return goToIcon;
      case "home":
        return homeIcon;
      case "park":
        return parkIcon;
      case "job":
        return jobIcon;
      default:
        return null;
    }
  };
  
export { getStatus, getNoteIcon };