import FollowCard from "./followCard";

const FollowList = ({ list, onFollowToggleSuccess }) => {
  return (
    <div>
      {list && (
        <div>
          {list.length != 0 ? (
            <div>
              {list.map((user) => (
                <FollowCard
                  key={user.id}
                  user={user}
                  onFollowToggleSuccess={onFollowToggleSuccess}
                />
              ))}
            </div>
          ) : (
            <div className="font-presentation flex justify-center items-center h-[200px] text-4xl">
              아직 없어요
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FollowList;
