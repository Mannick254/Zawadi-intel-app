import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./profile.css"; // external stylesheet for cleaner UI

export default function Profile() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        console.error("Error fetching user:", error?.message);
        navigate("/login");
      } else {
        setUser(data.user);
        setDisplayName(data.user.user_metadata?.full_name || "");
        setBio(data.user.user_metadata?.bio || "");
        setLocation(data.user.user_metadata?.location || "");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
    } else {
      alert("Logged out successfully!");
      navigate("/");
    }
  };

  const handleSave = async () => {
    setLoading(true);

    let avatarUrl = user.user_metadata?.avatar_url;

    // If a new avatar file is selected, upload it to Supabase storage
    if (avatarFile) {
      const fileName = `avatar-${user.id}-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) {
        alert("Error uploading avatar: " + uploadError.message);
      } else {
        const { data: publicUrl } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);
        avatarUrl = publicUrl.publicUrl;
      }
    }

    const { data: updatedUserData, error } = await supabase.auth.updateUser({
      data: {
        full_name: displayName,
        bio,
        location,
        avatar_url: avatarUrl,
      },
    });

    setLoading(false);

    if (error) {
      alert("Error updating profile: " + error.message);
    } else if (updatedUserData) {
      await supabase.auth.refreshSession();
      setUser(updatedUserData.user);
      alert("Profile updated!");
      setIsEditing(false);
      setAvatarFile(null);
    }
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <h1>Your Profile</h1>

      <div className="profile-header">
        <img
          src={
            avatarFile
              ? URL.createObjectURL(avatarFile)
              : user.user_metadata?.avatar_url || "https://via.placeholder.com/100"
          }
          alt="avatar"
          className="profile-avatar"
        />
        {!isEditing && <h2 className="profile-name">{displayName}</h2>}
      </div>

      {!isEditing ? (
        <div className="profile-actions">
          <button className="edit" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
          <button className="logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="profile-form">
          <label>
            Display Name:
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>

          <label>
            Bio:
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>

          <label>
            Location:
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </label>

          <label>
            Upload Avatar:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files[0])}
            />
          </label>

          <div className="profile-actions">
            <button className="save" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
