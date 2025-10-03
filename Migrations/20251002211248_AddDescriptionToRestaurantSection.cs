using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodDeliveryApi.Migrations
{
    /// <inheritdoc />
    public partial class AddDescriptionToRestaurantSection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Active",
                table: "RestaurantMenuItems",
                newName: "Available");

            migrationBuilder.RenameIndex(
                name: "IX_RestaurantMenuItems_RestaurantId_Active",
                table: "RestaurantMenuItems",
                newName: "IX_RestaurantMenuItems_RestaurantId_Available");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "RestaurantSections",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "RestaurantMenuItems",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Allergens",
                table: "RestaurantMenuItems",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "RestaurantSections");

            migrationBuilder.DropColumn(
                name: "Allergens",
                table: "RestaurantMenuItems");

            migrationBuilder.RenameColumn(
                name: "Available",
                table: "RestaurantMenuItems",
                newName: "Active");

            migrationBuilder.RenameIndex(
                name: "IX_RestaurantMenuItems_RestaurantId_Available",
                table: "RestaurantMenuItems",
                newName: "IX_RestaurantMenuItems_RestaurantId_Active");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "RestaurantMenuItems",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000);
        }
    }
}
