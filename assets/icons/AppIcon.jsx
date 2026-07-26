import React from "react";
import { View } from "react-native";

import ArrowLeftIcon from "../../assets/icons/arrow-left.svg";
import ChevronDownIcon from "../../assets/icons/chevron-down.svg";
import CalendarIcon from "../../assets/icons/calendar.svg";
import EyeIcon from "../../assets/icons/eye.svg";
import EyeOffIcon from "../../assets/icons/eye-off.svg";
import UserIcon from "../../assets/icons/user.svg";
import EmailIcon from "../../assets/icons/email.svg";
import PhoneIcon from "../../assets/icons/phone.svg";
import LockIcon from "../../assets/icons/lock.svg";
import SearchIcon from "../../assets/icons/search.svg";
import GoogleIcon from "../../assets/icons/google.svg";
import HeartIcon from "../../assets/icons/heart.svg";
import HomeIcon from "../../assets/icons/home.svg";
import BellIcon from "../../assets/icons/bell.svg";
import ShoppingBagIcon from "../../assets/icons/shopping-bag.svg";
import GridIcon from "../../assets/icons/grid.svg";
import CarIcon from "../../assets/icons/car.svg";
import PlaneIcon from "../../assets/icons/plane.svg";
import PdfIcon from "../../assets/icons/pdf.svg";

const icons = {
  "arrow-left": ArrowLeftIcon,
  "chevron-down": ChevronDownIcon,
  calendar: CalendarIcon,
  eye: EyeIcon,
  "eye-off": EyeOffIcon,
  user: UserIcon,
  email: EmailIcon,
  phone: PhoneIcon,
  lock: LockIcon,
  search: SearchIcon,
  google: GoogleIcon,
  heart: HeartIcon,
  home: HomeIcon,
  bell: BellIcon,
  "shopping-bag": ShoppingBagIcon,
  grid: GridIcon,
  car: CarIcon,
  plane: PlaneIcon,
  pdf: PdfIcon,
};

export default function AppIcon({ name, size = 20, color = "#19213D", style }) {
  const Icon = icons[name];

  if (!Icon) {
    return <View style={[{ width: size, height: size }, style]} />;
  }

  return <Icon width={size} height={size} color={color} style={style} />;
}
