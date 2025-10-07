using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodDeliveryApi.Migrations
{
    /// <inheritdoc />
    public partial class CreateMenuItemVariantsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add missing columns to MenuItemVariants table
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "MenuItemVariants",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "MenuItemVariants",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Size",
                table: "MenuItemVariants",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Unit",
                table: "MenuItemVariants",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Weight",
                table: "MenuItemVariants",
                type: "decimal(10,3)",
                precision: 10,
                scale: 3,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Dimensions",
                table: "MenuItemVariants",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SKU",
                table: "MenuItemVariants",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "StockQuantity",
                table: "MenuItemVariants",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AvailableUntil",
                table: "MenuItemVariants",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove the added columns in reverse order
            migrationBuilder.DropColumn(
                name: "AvailableUntil",
                table: "MenuItemVariants");

            migrationBuilder.DropColumn(
                name: "StockQuantity",
                table: "MenuItemVariants");

            migrationBuilder.DropColumn(
                name: "SKU",
                table: "MenuItemVariants");

            migrationBuilder.DropColumn(
                name: "Dimensions",
                table: "MenuItemVariants");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "MenuItemVariants");

            migrationBuilder.DropColumn(
                name: "Unit",
                table: "MenuItemVariants");

            migrationBuilder.DropColumn(
                name: "Size",
                table: "MenuItemVariants");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "MenuItemVariants");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "MenuItemVariants");
        }
    }
}
