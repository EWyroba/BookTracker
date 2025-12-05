import React from 'react';
import * as FiIcons from 'react-icons/fi';

// W typie IconName dodaj:
export type IconName =
    | 'FiHome'
    | 'FiBook'
    | 'FiBarChart2'
    | 'FiSearch'
    | 'FiUser'
    | 'FiChevronDown'
    | 'FiLogOut'
    | 'FiMail'
    | 'FiLock'
    | 'FiEye'
    | 'FiEyeOff'
    | 'FiClock'
    | 'FiTrendingUp'
    | 'FiAward'
    | 'FiStar'
    | 'FiBookOpen'
    | 'FiPlus'
    | 'FiLoader'
    | 'FiAlertTriangle'
    | 'FiCheck'
    | 'FiTrash2'
    | 'FiArrowLeft'
    | 'FiEdit'
    | 'FiX'
    | 'FiSave'
    | 'FiRotateCcw'
    | 'FiLogIn'
    | 'FiUserPlus'
    | 'FiImage'
    | 'FiTarget'
    | 'FiCalendar'
    | 'FiRefreshCw'
    | 'FiUserX'
    | 'FiUserCheck'
    | 'FiCheckCircle'
    | 'FiAlertCircle'
    | 'FiMenu'











interface IconProps {
    name: IconName;
    size?: number;
    className?: string;
    color?: string;
}

export const Icon: React.FC<IconProps> = ({
                                              name,
                                              size = 20,
                                              className = '',
                                              color
                                          }) => {
    const IconComponent = FiIcons[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    const style = {
        fontSize: size,
        color: color,
    };

    return <IconComponent style={style} className={className} />;
};

export default Icon;