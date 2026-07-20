import { Github, Mail, FileText } from "lucide-react";

export const footerLinks = [
  {
    icon: Mail,
    label: "Email",
    value: "boostcamp9web05@gmail.com",
    href: "mailto:boostcamp9web05@gmail.com",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "Repository",
    href: "https://github.com/boostcampwm-2024/web05-Denamu",
    subLinks: [
      {
        label: "Wiki",
        href: "https://github.com/boostcampwm-2024/web05-Denamu/wiki",
      },
      {
        label: "Issues",
        href: "https://github.com/boostcampwm-2024/web05-Denamu/issues",
      },
    ],
  },
  {
    icon: FileText,
    label: "Notion",
    value: "Team Main Page",
    href: "https://balsam-barometer-716.notion.site/9-Web05-12de624056ec805aa368dcf042f4bea7?pvs=4",
  },
];

export const teamMembers = ["J103_박무성", "J152_안성윤", "J222_정명기", "J235_조민석", "J249_채준혁"];
