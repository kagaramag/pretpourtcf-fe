import React from "react";

import ArrowLeft from "@/assets/icons/ArrowLeft";
import TurnLeft from "@/assets/icons/TurnLeft";
import ArrowRight from "@/assets/icons/ArrowRight";
import AttachFile from "@/assets/icons/AttachFile";
import Bell from "@/assets/icons/Bell";
import Calendar from "@/assets/icons/Calendar";
import Clock from "@/assets/icons/Clock";
import CaretDown from "@/assets/icons/CaretDown";
import CaretUp from "@/assets/icons/CaretUp";
import ChartView from "@/assets/icons/ChartView";
import Check from "@/assets/icons/Check";
import Close from "@/assets/icons/Close";
import Copy from "@/assets/icons/Copy";
import Dashboard from "@/assets/icons/Dashboard";
import Done from "@/assets/icons/Done";
import Download from "@/assets/icons/Download";
import Dustbin from "@/assets/icons/Dustbin";
import Edit from "@/assets/icons/Edit";
import Ellipsis from "@/assets/icons/Ellipsis";
import Email from "@/assets/icons/Email";
import File from "@/assets/icons/File";
import Filter from "@/assets/icons/Filter";
import Folder from "@/assets/icons/Folder";
import Home from "@/assets/icons/Home";
import Info from "@/assets/icons/Info";
import ListView from "@/assets/icons/ListView";
import Loading from "@/assets/icons/Loading";
import Logout from "@/assets/icons/Logout";
import Message from "@/assets/icons/Message";
import Moon from "@/assets/icons/Moon";
import Open from "@/assets/icons/Open";
import Permission from "@/assets/icons/Permission";
import Phone from "@/assets/icons/Phone";
import Play from "@/assets/icons/Play";
import Plus from "@/assets/icons/Plus";
import Post from "@/assets/icons/Post";
import Print from "@/assets/icons/Print";
import Profile from "@/assets/icons/Profile";
import Recall from "@/assets/icons/Recall";
import Refresh from "@/assets/icons/Refresh";
import Remove from "@/assets/icons/Remove";
import Report from "@/assets/icons/Report";
import Reverse from "@/assets/icons/Reverse";
import Role from "@/assets/icons/Role";
import Search from "@/assets/icons/Search";
import Settings from "@/assets/icons/Settings";
import SidebarClose from "@/assets/icons/SidebarClose";
import SidebarOpen from "@/assets/icons/SidebarOpen";
import Sign from "@/assets/icons/Sign";
import Stop from "@/assets/icons/Stop";
import Sum from "@/assets/icons/Sum";
import Sun from "@/assets/icons/Sun";
import Upload from "@/assets/icons/Upload";
import Upward from "@/assets/icons/Upward";
import User from "@/assets/icons/User";
import UserLine from "@/assets/icons/UserLine";
import Validate from "@/assets/icons/Validate";
import Verified from "@/assets/icons/Verified";
import Player from "@/assets/icons/Player";
import Write from "@/assets/icons/Write";
import Listen from "@/assets/icons/Listen";
import Speak from "@/assets/icons/Speak";
import Read from "@/assets/icons/Read";
import Certificate from "@/assets/icons/Certificate";
import Subscription from "@/assets/icons/Subscription";
import Promo from "@/assets/icons/Promo";
import Corporate from "@/assets/icons/Corporate";
import Facebook from "@/assets/icons/Facebook";
import Twitter from "@/assets/icons/Twitter";
import Instagram from "@/assets/icons/Instagram";
import Linkedin from "@/assets/icons/Linkedin";
import Globe from "@/assets/icons/Globe";
import Flame from "@/assets/icons/Flame";
import Trophy from "@/assets/icons/Trophy";
import Zap from "@/assets/icons/Zap";
import Star from "@/assets/icons/Star";
import Sparkles from "@/assets/icons/Sparkles";
import Brain from "@/assets/icons/Brain";
import DollarSign from "@/assets/icons/DollarSign";
import ReceiptText from "@/assets/icons/ReceiptText";
import Tag from "@/assets/icons/Tag";
import TrendingUp from "@/assets/icons/TrendingUp";
import FileText from "@/assets/icons/FileText";
import FileQuestion from "@/assets/icons/FileQuestion";
import Volume from "@/assets/icons/Volume";
import ImageIcon from "@/assets/icons/ImageIcon";
import Save from "@/assets/icons/Save";
import Trash from "@/assets/icons/Trash";
import CaretLeft from "@/assets/icons/CaretLeft";
import CaretRight from "@/assets/icons/CaretRight";
import RotateCcw from "@/assets/icons/RotateCcw";
import Send from "@/assets/icons/Send";
import Pause from "@/assets/icons/Pause";
import CircleIcon from "@/assets/icons/CircleIcon";
import XCircle from "@/assets/icons/XCircle";
import UserPlus from "@/assets/icons/UserPlus";
import UserGroup from "@/assets/icons/UserGroup";
import Monitor from "@/assets/icons/Monitor";
import Smartphone from "@/assets/icons/Smartphone";
import Tablet from "@/assets/icons/Tablet";
import Laptop from "@/assets/icons/Laptop";
import MapPin from "@/assets/icons/MapPin";
import Activity from "@/assets/icons/Activity";
import MessageSquare from "@/assets/icons/MessageSquare";
import EyeClosed from "@/assets/icons/EyeClosed";
import EyeOpen from "@/assets/icons/EyeOpen";
import History from "@/assets/icons/History";
import Notebook from "@/assets/icons/Notebook";
import ChevronUp from "@/assets/icons/ChevronUp";
import List from "@/assets/icons/List";
import Premium from "@/assets/icons/Premium";
import Record from "@/assets/icons/Record";

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

const icons = {
  arrowLeft: ArrowLeft,
  turnLeft: TurnLeft,
  arrowRight: ArrowRight,
  attachFile: AttachFile,
  bell: Bell,
  profile: Profile,
  calendar: Calendar,
  clock: Clock,
  caretDown: CaretDown,
  caretUp: CaretUp,
  chartView: ChartView,
  check: Check,
  close: Close,
  copy: Copy,
  dashboard: Dashboard,
  done: Done,
  download: Download,
  dustbin: Dustbin,
  edit: Edit,
  folder: Folder,
  ellipsis: Ellipsis,
  email: Email,
  file: File,
  filter: Filter,
  home: Home,
  info: Info,
  open: Open,
  report: Report,
  listView: ListView,
  loading: Loading,
  logout: Logout,
  message: Message,
  phone: Phone,
  play: Play,
  plus: Plus,
  print: Print,
  recall: Recall,
  refresh: Refresh,
  remove: Remove,
  reverse: Reverse,
  search: Search,
  settings: Settings,
  sidebarClose: SidebarClose,
  sidebarOpen: SidebarOpen,
  sign: Sign,
  stop: Stop,
  upload: Upload,
  upward: Upward,
  user: User,
  post: Post,
  role: Role,
  moon: Moon,
  userLine: UserLine,
  sun: Sun,
  sum: Sum,
  verified: Verified,
  validate: Validate,
  permission: Permission,
  player: Player,
  write: Write,
  listen: Listen,
  speak: Speak,
  read: Read,
  certificate: Certificate,
  subscription: Subscription,
  promo: Promo,
  corporate: Corporate,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  globe: Globe,
  flame: Flame,
  trophy: Trophy,
  zap: Zap,
  star: Star,
  sparkles: Sparkles,
  brain: Brain,
  dollarSign: DollarSign,
  receiptText: ReceiptText,
  tag: Tag,
  trendingUp: TrendingUp,
  fileText: FileText,
  fileQuestion: FileQuestion,
  volume: Volume,
  imageIcon: ImageIcon,
  save: Save,
  trash: Trash,
  caretLeft: CaretLeft,
  caretRight: CaretRight,
  rotateCcw: RotateCcw,
  send: Send,
  pause: Pause,
  circleIcon: CircleIcon,
  xCircle: XCircle,
  userPlus: UserPlus,
  userGroup: UserGroup,
  monitor: Monitor,
  smartphone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  mapPin: MapPin,
  activity: Activity,
  messageSquare: MessageSquare,
  eyeClosed: EyeClosed,
  history: History,
  notebook: Notebook,
  chevronUp: ChevronUp,
  list: List,
  eyeOpen: EyeOpen,
  premium: Premium,
  record: Record,
} as const satisfies Record<string, IconComponent>;

export type IconName = keyof typeof icons;

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = "currentColor",
  className,
  style,
  ...props
}) => {
  const IconComponent = icons[name];

  if (!IconComponent) {
    return null;
  }

  return React.createElement(IconComponent, {
    width: size,
    height: size,
    className,
    style: {
      color,
      ...style,
    },
    ...props,
  });
};

export function getIcon(name: IconName): IconComponent | undefined {
  return icons[name];
}

export function isValidIconName(name: string): name is IconName {
  return name in icons;
}

export {
  ArrowLeft,
  TurnLeft,
  ArrowRight,
  AttachFile,
  Bell,
  Calendar,
  Clock,
  CaretDown,
  CaretUp,
  ChartView,
  Check,
  Close,
  Copy,
  Dashboard,
  Done,
  Download,
  Dustbin,
  Edit,
  Ellipsis,
  Email,
  File,
  Filter,
  Folder,
  Home,
  Info,
  ListView,
  Loading,
  Logout,
  Message,
  Moon,
  Open,
  Permission,
  Phone,
  Play,
  Plus,
  Post,
  Print,
  Profile,
  Recall,
  Refresh,
  Remove,
  Report,
  Reverse,
  Role,
  Search,
  Settings,
  SidebarClose,
  SidebarOpen,
  Sign,
  Stop,
  Sum,
  Sun,
  Upload,
  Upward,
  User,
  UserLine,
  Validate,
  Verified,
  Player,
  Write,
  Listen,
  Speak,
  Read,
  Certificate,
  Subscription,
  Promo,
  Corporate,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Globe,
  Flame,
  Trophy,
  Zap,
  Star,
  Sparkles,
  Brain,
  DollarSign,
  ReceiptText,
  Tag,
  TrendingUp,
  FileText,
  FileQuestion,
  Volume,
  ImageIcon,
  Save,
  Trash,
  CaretLeft,
  CaretRight,
  RotateCcw,
  Send,
  Pause,
  CircleIcon,
  XCircle,
  UserPlus,
  UserGroup,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  MapPin,
  Activity,
  MessageSquare,
  EyeClosed,
  History,
  Notebook,
  ChevronUp,
  List,
  EyeOpen,
  Premium,
  Record,
};

export const iconNames = Object.keys(icons) as IconName[];
