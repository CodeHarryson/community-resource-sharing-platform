import React, { useEffect, useState } from 'react';
import { IconButton, Badge, Popover, List, ListItem, ListItemText, Typography, ListItemSecondaryAction, IconButton as MuiIconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import API from '../api';

export default function NotificationBell() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const open = Boolean(anchorEl);

    const fetchNotifications = async () => {
        try {
            const res = await API.get('/notifications');
            setNotifications(res.data || []);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkRead = async (id) => {
        try {
            await API.patch(`/notifications/${id}`);
            setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) { console.error(err); }
    };

    return (
        <>
            <IconButton color="inherit" onClick={(e) => { setAnchorEl(e.currentTarget); fetchNotifications(); }}>
                <Badge badgeContent={unreadCount} color="secondary">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <List sx={{ width: 360 }}>
                    <ListItem>
                        <Typography variant="subtitle1">Notifications</Typography>
                    </ListItem>
                    {notifications.length === 0 && (
                        <ListItem>
                            <ListItemText primary="No notifications" />
                        </ListItem>
                    )}
                    {notifications.map(n => (
                        <ListItem key={n.id} divider>
                            <ListItemText primary={n.message} secondary={new Date(n.created_at).toLocaleString()} />
                            <ListItemSecondaryAction>
                                {!n.read && (
                                    <MuiIconButton edge="end" aria-label="mark-read" onClick={() => handleMarkRead(n.id)} size="small">
                                        <CheckIcon fontSize="small" />
                                    </MuiIconButton>
                                )}
                                <MuiIconButton edge="end" aria-label="delete" onClick={() => handleDelete(n.id)} size="small">
                                    <DeleteIcon fontSize="small" />
                                </MuiIconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Popover>
        </>
    );
}
